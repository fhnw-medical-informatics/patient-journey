import React, { useCallback, useEffect, useRef, useState } from 'react'
import OpenAI from 'openai'

import { Button, Card, Divider, FormControlLabel, Stack, Switch, TextField, Theme, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

import { makeStyles } from '../../utils'

import { AssistantMessage } from './AssistantMessage'
import { AssistantTemplates } from './AssistantTemplates'

const messageStyles = (theme: Theme) => ({
  width: '90%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  margin: 0,
})

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
  chatContainer: {
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  chatMessageLeft: {
    ...messageStyles(theme),
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.background.default,
  },
  chatMessageCenter: {
    ...messageStyles(theme),
    width: 'auto',
    alignSelf: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  chatMessageRight: {
    ...messageStyles(theme),
    alignSelf: 'flex-end',
    backgroundColor: theme.palette.info.main,
  },
  chatMessageText: {
    margin: 0,
    padding: 0,
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: `0 ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)}`,
    gap: theme.spacing(1),
  },
  loadingBubble: {
    display: 'flex',
    justifyContent: 'flex-start',
    gap: theme.spacing(1),
    '& > span:nth-of-type(1)': {
      animation: 'loading 1s infinite',
      animationDelay: '0s',
    },
    '& > span:nth-of-type(2)': {
      animation: 'loading 1s infinite',
      animationDelay: '0.33s',
    },
    '& > span:nth-of-type(3)': {
      animation: 'loading 1s infinite',
      animationDelay: '0.66s',
    },
    '@keyframes loading': {
      '0%': {
        opacity: 0.2,
      },
      '50%': {
        opacity: 1,
      },
      '100%': {
        opacity: 0.2,
      },
    },
  },
  loadingCircle: {
    width: '1em',
    height: '1em',
    borderRadius: '50%',
    backgroundColor: theme.palette.background.default,
  },
}))

interface AssistantProps {
  messages: OpenAI.Beta.Threads.Messages.ThreadMessage[]
  onSubmitMessage: (message: string, useCohort: boolean, useSelectedPatient: boolean) => void
  cohortSize: number
  hasSelectedPatient: boolean
  isLoading: boolean
}

export const Assistant = ({ messages, onSubmitMessage, cohortSize, hasSelectedPatient, isLoading }: AssistantProps) => {
  const { classes } = useStyles()

  const [inputValue, setInputValue] = useState('')
  const [useCohort, setUseCohort] = useState(false)
  const [useSelectedPatient, setUseSelectedPatient] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleUseCohortChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCohort(event.target.checked)
  }, [])

  const handleUseSelectedPatientChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setUseSelectedPatient(event.target.checked)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleSubmit = useCallback(
    (text: string, cohort: boolean, selectedPatient: boolean) => {
      onSubmitMessage(text, cohort, selectedPatient)
      setUseCohort(false)
      setUseSelectedPatient(false)
      setInputValue('')
    },
    [onSubmitMessage]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(inputValue, useCohort, useSelectedPatient)
      }
    },
    [inputValue, useCohort, useSelectedPatient, handleSubmit]
  )

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (!hasSelectedPatient) setUseSelectedPatient(false)
  }, [hasSelectedPatient])

  useEffect(() => {
    if (cohortSize === 0) setUseCohort(false)
  }, [cohortSize])

  console.log(useSelectedPatient)

  return (
    <Card variant="outlined" className={classes.root}>
      {/* Chat Container */}
      <div className={classes.chatContainer}>
        {[...messages].reverse().map((message, index) => (
          <AssistantMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className={classes.loadingBubble}>
            <span className={classes.loadingCircle} />
            <span className={classes.loadingCircle} />
            <span className={classes.loadingCircle} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Container */}
      <div className={classes.inputContainer}>
        <Divider />
        <Stack direction="row" gap={4}>
          <Typography variant="overline">Add context</Typography>
          <Stack direction="row" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={useCohort}
                  onChange={handleUseCohortChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                  size="small"
                />
              }
              label={`Cohort ${cohortSize > 0 ? `(${cohortSize})` : ''}`}
              disabled={cohortSize === 0}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={useSelectedPatient}
                  onChange={handleUseSelectedPatientChange}
                  inputProps={{ 'aria-label': 'controlled' }}
                  size="small"
                />
              }
              label={`Selected Patient`}
              disabled={!hasSelectedPatient}
            />
          </Stack>
        </Stack>
        <Stack direction="column" gap={2}>
          <TextField
            id="filled-textarea"
            label="Prompt"
            placeholder="Enter a prompt…"
            multiline
            variant="filled"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <Stack direction="row" justifyContent={'space-between'} alignItems={'center'}>
            <AssistantTemplates onTemplateClick={setInputValue} disabled={isLoading} />
            <Stack direction="row" alignItems={'center'} gap={2}>
              <Button
                onClick={() => handleSubmit(inputValue, useCohort, useSelectedPatient)}
                variant="contained"
                endIcon={<SendIcon />}
                disabled={isLoading}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Card>
  )
}
