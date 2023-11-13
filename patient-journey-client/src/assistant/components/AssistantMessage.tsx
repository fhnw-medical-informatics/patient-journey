import React from 'react'
import OpenAI from 'openai'
import { MuiMarkdown } from 'mui-markdown'

import { makeStyles } from '../../utils'
import { Theme } from '@mui/material'

const messageStyles = (theme: Theme) => ({
  width: '90%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  margin: 0,
})

const useStyles = makeStyles()((theme) => ({
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
}))

interface AssistantMessageProps {
  message: OpenAI.Beta.Threads.Messages.ThreadMessage
}

export const AssistantMessage = ({ message }: AssistantMessageProps) => {
  const { classes } = useStyles()

  return (
    <>
      {(message.metadata as any)?.isContext?.toLowerCase() === 'true' ? (
        (message.metadata as any)?.showContext?.toLowerCase() === 'true' && (
          <div key={message.id} className={classes.chatMessageCenter}>
            <p className={classes.chatMessageText}>Context: {(message.metadata as any)?.contextTitle}</p>
          </div>
        )
      ) : (
        <div key={message.id} className={message.role === 'user' ? classes.chatMessageRight : classes.chatMessageLeft}>
          {message.content.map((content, index) => {
            switch (content.type) {
              case 'text':
                return (
                  <div key={index} className={classes.chatMessageText}>
                    {/* <Markdown remarkPlugins={[remarkGfm]} disallowedElements={[]}>
                      {content.text.value}
                    </Markdown> */}
                    <MuiMarkdown>{content.text.value}</MuiMarkdown>
                  </div>
                )
              case 'image_file':
              default:
                return <img key={index} src={content.image_file.file_id} alt="" />
            }
          })}
        </div>
      )}
    </>
  )
}