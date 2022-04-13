import { COLOR_LEGEND_GRADIENT_SIZE, COLOR_LEGEND_SIZE } from './shared'
import { makeStyles } from '../../utils'

const useStyles = makeStyles<Props>()((_, { colorStops }) => ({
  root: {
    display: 'flex',
  },
  gradient: {
    width: COLOR_LEGEND_GRADIENT_SIZE / colorStops.length,
    height: COLOR_LEGEND_SIZE,
    alignSelf: 'center',
  },
}))

interface Props {
  readonly colorStops: ReadonlyArray<string>
}

export const ColorLegendGradient = ({ colorStops }: Props) => {
  const { classes } = useStyles({ colorStops })
  return (
    <div className={classes.root}>
      {colorStops.map((colorStop, index) => {
        if (index < colorStops.length - 1) {
          const style = {
            background: `linear-gradient(to right, ${colorStops[index]}, ${colorStops[index + 1]})`,
          }
          return <div key={colorStop} className={classes.gradient} style={style} />
        } else {
          return <div key={colorStop} />
        }
      })}
    </div>
  )
}
