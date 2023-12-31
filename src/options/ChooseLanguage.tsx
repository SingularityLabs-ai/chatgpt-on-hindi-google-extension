import React from 'react'
import { Button, CssBaseline, GeistProvider, Radio, Text, Toggle, useToasts } from '@geist-ui/core'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { SearchEngine } from '../content-script/search-engine-configs'
import { config as languages } from '../content-script/language-configs'
import { Language } from '../content-script/language-configs'
import { Text, Card, Button, Spacer, useToasts, Checkbox } from '@geist-ui/core'
import { updateUserConfig } from '../config'
import { changeToast, isIOS } from '../utils/parse'

interface Props {
  activeLanguage: string
  setActiveLanguageCallback: (activeLanguage: string) => void
  // allSites: string[]
  languages: Record<string, Language>
  // supportSites: Record<string, SearchEngine>
}

function ChooseLanguage(props: Props) {
  const { activeLanguage, setActiveLanguageCallback, languages } = props
  const { setToast } = useToasts()

  // const onSaveSelect = useCallback(() => {
  //   updateUserConfig({ activeLanguage })
  //   setToast(changeToast)
  // }, [setToast, activeLanguage])

  const onChangeSites = (value) => {
    setActiveLanguageCallback(value)
  }

  return (
    <>
      {!isIOS && (
        <>
          <Card>
            <Card.Content>
              <Radio.Group
                value={activeLanguage}
                onChange={onChangeSites}
                className="beyondbard--support__sites"
              >
                {Object.entries(languages).map(([k, v]) => {
                  return (
                    <Radio key={k} value={v.code} className="beyondbard--support__sites--item">
                      {v.name}
                    </Radio>
                  )
                })}
              </Radio.Group>
            </Card.Content>
          </Card>
        </>
      )}
    </>
  )
}

export default ChooseLanguage
