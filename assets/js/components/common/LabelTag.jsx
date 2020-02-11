import React, { Component } from 'react'
import { Tag } from 'antd';

const LabelTag = ({ text, color, style }) => (
  <Tag style={style} color={color ? color : "geekblue"}>{text}</Tag>
)

export const labelColors = [
  "geekblue",
  "cyan",
  "purple",
  "magenta",
  "gold",
  "lime",
  "volcano",
]

export default LabelTag
