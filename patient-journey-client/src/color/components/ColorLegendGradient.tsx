import { makeStyles } from '../../utils'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    paddingBottom: theme.spacing(1),
    paddingRight: 0,
  },
  gradient: {
    width: '100%',
    height: 10,
    alignSelf: 'center',
  },
}))

interface Props {
  readonly colorStops: ReadonlyArray<string>
}

export const ColorLegendGradient = ({ colorStops }: Props) => {
  const { classes } = useStyles()
  return (
    <div className={classes.root}>
      {colorStops.map((colorStop, index) => {
        if (index < colorStops.length - 1) {
          const style = {
            background: `linear-gradient(to right, ${colorStops[index]}, ${colorStops[index + 1]})`,
          }
          return <div key={index} className={classes.gradient} style={style} />
        } else {
          return <div key={index} />
        }
      })}
    </div>
  )
}
