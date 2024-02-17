import { MuiMarkdown } from 'mui-markdown'
import { makeStyles } from '../../utils'
import { Theme, Tooltip } from '@mui/material'
import { ChatMessageData } from '../chatSlice'
import ErrorIcon from '@mui/icons-material/Error'

const messageStyles = (theme: Theme) => ({
  maxWidth: '90%',
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  margin: 0,
  '& h1': {
    fontSize: '2rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  '& h2': {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  '& h3': {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  '& p': {
    marginBottom: theme.spacing(1),
  },
  // Strong should be highlighted with a marker color
  '& strong': {
    fontWeight: 600,
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
})

const useStyles = makeStyles()((theme) => ({
  chatMessageLeft: {
    position: 'relative',
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
    '& > div': {
      display: 'grid',
    },
  },
  errorIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: -10,
    marginRight: -10,
  },
}))

interface Props {
  message: ChatMessageData
}

export const ChatMessage = ({ message }: Props) => {
  const { classes } = useStyles()

  return (
    <>
      {message.isContext ? (
        message.showContext && (
          <div className={classes.chatMessageCenter}>
            <p className={classes.chatMessageText}>Context: {message.contextTitle}</p>
          </div>
        )
      ) : (
        <div className={message.role === 'user' ? classes.chatMessageRight : classes.chatMessageLeft}>
          {message.showTruncationError && (
            <Tooltip title={'Truncated (max number of tokens reached)'}>
              <ErrorIcon className={classes.errorIcon} color="warning" />
            </Tooltip>
          )}
          <div className={classes.chatMessageText}>
            <MuiMarkdown>{message.content.replace(/\n/g, '\n\n')}</MuiMarkdown>
          </div>
        </div>
      )}
    </>
  )
}
