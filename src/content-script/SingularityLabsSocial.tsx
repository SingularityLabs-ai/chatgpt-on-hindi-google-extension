import i18n from 'i18next'
import { memo } from 'react'
import { initReactI18next, useTranslation } from 'react-i18next'
import { AppWidth, Theme } from '~config'

import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'

import discordIcon from '~assets/icons/discord-black-thin.svg'
import discordWhiteIcon from '~assets/icons/discord-white-thin.svg'
export const DISCORD_HOME = 'https://discord.gg/jc4xtF58Ve'

import githubIcon from '~assets/icons/github-black-thin.svg'
import githubWhiteIcon from '~assets/icons/github-white-thin.svg'
export const GITHUB_HOME = 'https://github.com/SingularityLabs-ai'

import ideaIcon from '~assets/icons/lightbulb-black-thin.svg'
import ideaWhiteIcon from '~assets/icons/lightbulb-white-thin.svg'
export const IDEA_HOME = 'https://github.com/orgs/SingularityLabs-ai/discussions/new?category=ideas'

import twitterIcon from '~assets/icons/twitter-black-thin.svg'
import twitterWhiteIcon from '~assets/icons/twitter-white-thin.svg'
export const TWITTER_HOME = 'https://twitter.com/labssingularity'

import linkedinIcon from '~assets/icons/linkedin-black-thin.svg'
import linkedinWhiteIcon from '~assets/icons/linkedin-white-thin.svg'
export const LINKEDIN_HOME = 'https://www.linkedin.com/company/singularity-labs-ai'

import whatsappIcon from '~assets/icons/whatsapp-black-thin.svg'
import whatsappWhiteIcon from '~assets/icons/whatsapp-white-thin.svg'
export const WHATSAPP_HOME = 'https://whatsapp.com/channel/0029VaC7s04FCCoXugMGhR26'

import redditIcon from '~assets/icons/reddit-black-thin.svg'
import redditWhiteIcon from '~assets/icons/reddit-white-thin.svg'
export const REDDIT_HOME = 'https://www.reddit.com/r/SingularityLabs'

export const SLACK_HOME =
  'https://join.slack.com/t/singularitylabsai/shared_invite/zt-2co2tzoo0-0DFYPGmtl9aDdZYOikRV9A'

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: false,
})

function IconButton(props: { icon: string; onClick?: () => void }) {
  //TODO: ! (ie important) is used for yahoo.com
  return (
    <div
      className="p-[2px] rounded-[8px] w-fit cursor-pointer hover:opacity-80 bg-secondary bg-opacity-20"
      onClick={props.onClick}
    >
      <img src={props.icon} className="!w-4 !h-4" />
    </div>
  )
}

interface Props {
  theme?: Theme
  appWidth?: AppWidth
}

function SingularityLabsSocial(props: Props) {
  const { t } = useTranslation()
  console.log('SingularityLabsSocial:theme', props.theme)
  console.log('SingularityLabsSocial:appWidth', props.appWidth)
  const socials = [
    {
      url: DISCORD_HOME,
      tooltipid: 'discord-tooltip',
      content: t('Discord'),
      whiteIcon: discordWhiteIcon,
      darkIcon: discordIcon,
    },
    {
      url: GITHUB_HOME,
      tooltipid: 'github-tooltip',
      content: t('Github'),
      whiteIcon: githubWhiteIcon,
      darkIcon: githubIcon,
    },
    {
      url: IDEA_HOME,
      tooltipid: 'idea-tooltip',
      content: t('Ideas'),
      whiteIcon: ideaWhiteIcon,
      darkIcon: ideaIcon,
    },
    {
      url: TWITTER_HOME,
      tooltipid: 'twitter-tooltip',
      content: t('Twitter'),
      whiteIcon: twitterWhiteIcon,
      darkIcon: twitterIcon,
    },
    {
      url: LINKEDIN_HOME,
      tooltipid: 'linkedin-tooltip',
      content: t('Linkedin'),
      whiteIcon: linkedinWhiteIcon,
      darkIcon: linkedinIcon,
    },
    {
      url: WHATSAPP_HOME,
      tooltipid: 'whatsapp-tooltip',
      content: t('Whatsapp'),
      whiteIcon: whatsappWhiteIcon,
      darkIcon: whatsappIcon,
    },
    {
      url: REDDIT_HOME,
      tooltipid: 'reddit-tooltip',
      content: t('Reddit'),
      whiteIcon: redditWhiteIcon,
      darkIcon: redditIcon,
    },
  ]

  // const n = props.appWidth === AppWidth.Narrow ? 5 : props.appWidth === AppWidth.Medium ? 7 : 9
  const n = 5
  const socials_shuffled = socials
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .slice(0, n)

  return (
    <div className="footer flex flex-row px-4 py-4 rounded-[10px] items-center gap-2 justify-evenly">
      {socials_shuffled.map((object) => (
        <span key={object.tooltipid}>
          <a
            href={object.url}
            target="_blank"
            rel="noreferrer"
            data-tooltip-id={object.tooltipid}
            data-tooltip-content={object.content}
          >
            <IconButton icon={props.theme == Theme.Dark ? object.whiteIcon : object.darkIcon} />
          </a>
          <Tooltip id={object.tooltipid} />
        </span>
      ))}
    </div>
  )
}

export default memo(SingularityLabsSocial)
