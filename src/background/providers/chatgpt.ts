import ExpiryMap from 'expiry-map'
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { fetchSSE } from '../fetch-sse'
import { GenerateAnswerParams, Provider } from '../types'
import { isDate } from '../../utils/parse'

async function request(token: string, method: string, path: string, data?: unknown) {
  return fetch(`https://chat.openai.com/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}

export async function sendMessageFeedback(token: string, data: unknown) {
  await request(token, 'POST', '/conversation/message_feedback', data)
}

export async function setConversationProperty(
  token: string,
  conversationId: string,
  propertyObject: object,
) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

const KEY_ACCESS_TOKEN = 'accessToken'

const cache = new ExpiryMap(10 * 1000)

export async function getChatGPTAccessToken(): Promise<string> {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN)
  }
  const resp = await fetch('https://chat.openai.com/api/auth/session')
  if (resp.status === 403) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken) {
    throw new Error('UNAUTHORIZED')
  }
  cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  return data.accessToken
}

export class ChatGPTProvider implements Provider {
  constructor(private token: string) {
    this.token = token
  }

  private async fetchModels(): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    const resp = await request(this.token, 'GET', '/models').then((r) => r.json())
    return resp.models
  }

  private async getModelName(): Promise<string> {
    try {
      const models = await this.fetchModels()
      return models[0].slug
    } catch (err) {
      console.error(err)
      return 'text-davinci-002-render'
    }
  }

  async generateAnswer(params: GenerateAnswerParams) {
    let conversationId: string | undefined

    const cleanup = () => {
      if (conversationId) {
        setConversationProperty(this.token, conversationId, { is_visible: false })
      }
    }

    const modelName = await this.getModelName()
    console.log('Using model:', modelName, params.conversationId, params.parentMessageId)

    const callfetchSSE = async (conversationId: string, with_conversation_id: bool) => {
      try {
        await fetchSSE('https://chat.openai.com/backend-api/conversation', {
          method: 'POST',
          signal: params.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({
            action: 'next',
            messages: [
              {
                id: uuidv4(),
                role: 'user',
                content: {
                  content_type: 'text',
                  parts: [params.prompt],
                },
              },
            ],
            model: modelName,
            parent_message_id: params.parentMessageId || uuidv4(),
            conversation_id: with_conversation_id ? params.conversationId : undefined,
          }),
          onMessage(message) {
            console.debug('sse message', message)
            if (message === '[DONE]') {
              params.onEvent({ type: 'done' })
              // cleanup()
              return
            }
            let data
            try {
              data = JSON.parse(message)
            } catch (err) {
              if (isDate(message)) {
                console.log("known error, It's date", message);
              } else {
                console.log(err)
                console.log(message)
              }
              return
            }
            const text = data.message?.content?.parts?.[0] + '✏'
            if (text) {
              Browser.storage.local.set({ conversationId: data.conversation_id })
              Browser.storage.local.set({ messageId: data.message.id })
              conversationId = data.conversation_id
              params.onEvent({
                type: 'answer',
                data: {
                  text,
                  messageId: data.message.id,
                  conversationId: data.conversation_id,
                  parentMessageId: data.parent_message_id,
                },
              })
            }
          },
        })
      } catch (e) {
        if (e.message.indexOf('Only one message at a time') != -1) {
          console.log('known error, Only one message at a time', e.message)
          params.onEvent({
            type: 'error',
            data: {
              error:
                'Only one message at a time. Please reload the page once the active message completes',
              conversationId: conversationId,
            },
          })
        } else if (e.message.indexOf('ve reached our limit of messages per hour') != -1) {
          console.log('known error, Reached our limit of messages per hour', e.message)
          params.onEvent({
            type: 'error',
            data: {
              error: 'You have reached our limit of messages per hour. Please try again later',
              conversationId: conversationId,
            },
          })
        } else {
          console.error(e.message)
          if (e.message.indexOf('conversation_not_found') != -1) {
            throw new Error(e.message);
          }
        }
      }
    }

    let retry_due_to_conversation_not_found: bool = false
    callfetchSSE(conversationId, true)
    .then((r)=>{console.log(r)})
    .catch((e)=>{
      console.log(e)
      console.error(e.message)
      if (e.message.indexOf('conversation_not_found') !== -1) {
        retry_due_to_conversation_not_found = true
        console.log('Lets retry_due_to_conversation_not_found')
      }
      if (retry_due_to_conversation_not_found) {
        cleanup()
        callfetchSSE(conversationId, false)
        .then((r)=>{console.log(r);
          retry_due_to_conversation_not_found = false
        })
        .catch((e)=>{
          console.log(e);
          console.error(e.message)
          if (e.message.indexOf('conversation_not_found') !== -1) {
            retry_due_to_conversation_not_found = true
            console.log('Its still conversation_not_found')
          }
        });
      }
    })

    return { cleanup }
  }
}
