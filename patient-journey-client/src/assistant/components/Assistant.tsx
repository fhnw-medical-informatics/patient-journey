import React, { useCallback, useState } from 'react'
import OpenAI from 'openai'

import {
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Theme,
  Typography,
} from '@mui/material'
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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleSubmit = useCallback(() => {
    onSubmitMessage(inputValue, useCohort, useSelectedPatient)
    setInputValue('')
    setUseCohort(false)
    setUseSelectedPatient(false)
  }, [onSubmitMessage, inputValue, useCohort, useSelectedPatient])

  return (
    <Card variant="outlined" className={classes.root}>
      {/* Chat Container */}
      <div className={classes.chatContainer}>
        {[...messages].reverse().map((message, index) => (
          <AssistantMessage key={message.id} message={message} />
        ))}
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
                  value={useCohort}
                  onChange={() => setUseCohort(!useCohort)}
                  disabled={cohortSize === 0}
                  size="small"
                />
              }
              label={`Cohort ${cohortSize > 0 ? `(${cohortSize})` : ''}`}
            />
            <FormControlLabel
              control={
                <Switch
                  value={useSelectedPatient}
                  onChange={() => setUseSelectedPatient(!useSelectedPatient)}
                  disabled={!hasSelectedPatient}
                  size="small"
                />
              }
              label={`Selected Patient`}
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
            disabled={isLoading}
          />
          <Stack direction="row" justifyContent={'space-between'} alignItems={'center'}>
            <AssistantTemplates onTemplateClick={setInputValue} disabled={isLoading} />
            <Stack direction="row" alignItems={'center'} gap={2}>
              {isLoading && <CircularProgress size={'1.5em'} />}
              <Button onClick={handleSubmit} variant="contained" endIcon={<SendIcon />} disabled={isLoading}>
                Submit
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </div>
    </Card>
  )
}
