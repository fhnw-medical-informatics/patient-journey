import { makeStyles } from '../../utils'
import CohortIcon from '@mui/icons-material/Grain'
import { Badge, IconButton } from '@mui/material'

const useStyles = makeStyles()((theme) => ({
  button: {
    color: theme.entityColors.cohort,
  },
  badge: {
    backgroundColor: theme.entityColors.cohort,
    color: theme.palette.background.paper,
  },
}))

interface Props {
  readonly count: number
}

export const CohortToolbarItem = ({ count }: Props) => {
  const { classes } = useStyles()

  return (
    <IconButton className={classes.button}>
      <Badge classes={{ badge: classes.badge }} badgeContent={count}>
        <CohortIcon />
      </Badge>
    </IconButton>
  )
}
