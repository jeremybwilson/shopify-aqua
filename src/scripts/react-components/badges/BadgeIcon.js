const BadgeIcon = props => {
  return (
    <div className="item-badge-icon" dangerouslySetInnerHTML={{ __html: props.icon }} />
  )
}

module.exports = BadgeIcon
