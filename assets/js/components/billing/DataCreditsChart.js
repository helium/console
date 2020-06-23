import React from 'react'
import {
  FlexibleXYPlot,
  XAxis,
  YAxis,
  VerticalBarSeries,
  LabelSeries
} from 'react-vis'

const blueData = [
  {x: 1, y: 12},
  {x: 2, y: 12},
  {x: 3, y: 12},
  {x: 4, y: 12},
  {x: 5, y: 12},
  {x: 6, y: 12},
  {x: 7, y: 12},
  {x: 8, y: 12},
  {x: 9, y: 12},
  {x: 10, y: 12},
  {x: 11, y: 12},
  {x: 12, y: 12},
  {x: 13, y: 12},
  {x: 14, y: 12},
  {x: 15, y: 12},
  {x: 16, y: 12},
  {x: 17, y: 12},
  {x: 18, y: 12},
  {x: 19, y: 12},
  {x: 20, y: 12},
  {x: 21, y: 12},
  {x: 22, y: 12},
  {x: 23, y: 12},
  {x: 24, y: 12},
  {x: 25, y: 12},
  {x: 26, y: 12},
  {x: 27, y: 12},
  {x: 28, y: 12},
  {x: 29, y: 12},
  {x: 30, y: 12},
]

const labelData = blueData.map(d => ({
  x: d.x,
  y: d.y,
}))

const DataCreditsChart = ({}) => (
  <FlexibleXYPlot xType="ordinal" height={300} xDistance={100}>
    <XAxis />
    <YAxis />
    <VerticalBarSeries data={blueData} />
    <LabelSeries data={labelData} />
  </FlexibleXYPlot>
)

export default DataCreditsChart
