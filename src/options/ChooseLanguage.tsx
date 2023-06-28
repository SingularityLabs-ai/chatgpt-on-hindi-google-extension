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
  setActiveLanguage: (activeLanguage: string) => void
  // allSites: string[]
  languages: Record<string, Language>
  // supportSites: Record<string, SearchEngine>
}

function ChooseLanguage(props: Props) {
  const { activeLanguage, setActiveLanguage, languages } = props
  const { setToast } = useToasts()

  const onSaveSelect = useCallback(() => {
    updateUserConfig({ activeLanguage })
    setToast(changeToast)
  }, [setToast, activeLanguage])

  const onChangeSites = (value) => {
    setActiveLanguage(value)
  }

  return (
    <>
      {!isIOS && (
        <>
          <Text h3 className="beyondbard--mt-5">
            Enable/Disable BeyondBard
            <Text font="12px" my={0}>
              You can enable/disable the BeyondBard Summary on the following website.
            </Text>
          </Text>

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
            <Card.Footer>
              <Spacer w={2} />
              <Button type="secondary" auto scale={1 / 3} onClick={onSaveSelect}>
                Save
              </Button>
            </Card.Footer>
          </Card>
        </>
      )}
    </>
  )
}

export default ChooseLanguage
