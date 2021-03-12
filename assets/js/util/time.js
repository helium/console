import moment from 'moment'

export const formatDatetime = (datetime, format = 'll') => (
  `${moment(parseInt(datetime)).utcOffset(moment().utcOffset()).format(format)} ${moment(parseInt(datetime)).utcOffset(moment().utcOffset()).format("h:mm:ss.SSS A")}`
)

export const formatDatetimeAgo = (datetime) => (
  moment.utc(datetime).utcOffset(moment().utcOffset()).fromNow()
)

export const getDiffInSeconds = (datetime) => (
  moment().diff(moment(datetime), 'seconds')
)
