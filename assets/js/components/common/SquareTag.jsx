import React, { Component } from 'react'

const SquareTag = ({ color }) => {
  let labelColor = color ? color : "geekblue"

  return (
    <div style={{ height: 25, width: 25, borderRadius: 5, marginRight: 10, marginTop: 2, marginBottom: 2, backgroundColor: labelColorsHex[labelColor] }}/>
  )
}

const labelColorsHex = {
  geekblue: "#1890ff",
  cyan: "#2ECEC4",
  purple: "#B37FEB",
  magenta: "#FF85C0",
  gold: "#F8C741",
  lime: "#7ed43a",
  volcano: "#FF7875",
}

export default SquareTag
