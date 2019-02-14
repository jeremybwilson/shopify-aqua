const ICONS = {
  WEATHERPROOFSEAL: require('./icons').WeatherproofSeal,
}

const getIconByKey = key => {
  const icon = ICONS[key]
  return icon ? icon() : null
}

const BadgeIcon = props => {
  const key = props.icon.toString().toUpperCase().replace(/\s/g, '')

  return (
    <div className="item-badge-icon">
      {getIconByKey(key)}
    </div>
  )
}

module.exports = BadgeIcon