import Browser from 'webextension-polyfill'
import { getChatGPTChatIds, getProviderConfigs, ProviderType } from '../config'
// import { BARDProvider, sendMessageFeedbackBard } from './providers/bard'
import { isDate } from '../utils/parse'
// import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from './providers/chatgpt'
import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from 'llm-playground-chain'
import { OpenAIProvider } from './providers/openai'
import { Provider } from './types'

async function generateAnswers(
  port: Browser.Runtime.Port,
  question: string,
  arkose_token: string,
  conversationId: string | undefined,
  parentMessageId: string | undefined,
  // conversationContext: ConversationContext | undefined,
) {
  const chatIds = await getChatGPTChatIds()
  console.log('chatIds', chatIds)
  if (conversationId == null || parentMessageId == null) {
    if (chatIds.conversationId != '0' && chatIds.messageId != '0') {
      conversationId = chatIds.conversationId
      parentMessageId = chatIds.messageId
    }
  }
  console.log('conversationId', conversationId)
  console.log('parentMessageId', parentMessageId)
  const providerConfigs = await getProviderConfigs()

  let provider: Provider
  // if (providerConfigs.provider === ProviderType.BARD) {
  //   provider = new BARDProvider()
  // } else
  if (providerConfigs.provider === ProviderType.ChatGPT) {
    const token = await getChatGPTAccessToken()
    provider = new ChatGPTProvider(token)
  } else if (providerConfigs.provider === ProviderType.GPT3) {
    const { apiKey, model } = providerConfigs.configs[ProviderType.GPT3]!
    provider = new OpenAIProvider(apiKey, model)
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    try {
      cleanup?.()
    } catch (err) {
      console.log(err)
    }
  })

  const { cleanup } = await provider.generateAnswer({
    prompt: question,
    signal: controller.signal,
    onEvent(event) {
      if (event.type === 'error') {
        port.postMessage({ event: 'ERROR', message: event.message })
        return
      }
      if (event.type === 'done') {
        port.postMessage({ event: 'DONE' })
        return
      }
      port.postMessage(event.data)
    },
    conversationId: conversationId, //used for chatGPT
    parentMessageId: parentMessageId, //used for chatGPT
    // conversationContext: conversationContext, //used for BARD
    arkoseToken: arkose_token,
  })
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug('received question msg', msg)
    try {
      await generateAnswers(
        port,
        msg.question,
        msg.arkose_token,
        msg.conversationId,
        msg.parentMessageId,
        // msg.conversationContext,
      )
    } catch (err: any) {
      if (isDate(msg)) {
        console.log("known error, It's date", msg)
      } else {
        console.log(err)
        console.log(msg)
        try {
          port.postMessage({ error: err.message })
        } catch (err2: any) {
          console.log(err2)
        }
      }
    }
  })
})

Browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'FEEDBACK') {
    const providerConfigs = await getProviderConfigs()
    if (providerConfigs.provider === ProviderType.ChatGPT) {
      const token = await getChatGPTAccessToken()
      await sendMessageFeedback(token, message.data)
    } else {
      await sendMessageFeedbackBard(message.data)
    }
  } else if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'GET_ACCESS_TOKEN') {
    return getChatGPTAccessToken()
  }
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()
  }
})
