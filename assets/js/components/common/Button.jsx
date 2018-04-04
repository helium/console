import React from 'react'

const Button = (props) => {
  const { onClick, type, text } = props

  return (
    <a onClick={onClick} className={`btn btn-${type}`}>
      {text}
    </a>
  )
}

Button.defaultProps = {
  type: 'default'
}

export default Button
