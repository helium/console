import moment from 'moment'

export const formatDatetime = (datetime, format = 'LLL') => (
  moment.utc(datetime).utcOffset(moment().utcOffset()).format(format)
)

export const formatUnixDatetime = (datetime, format = 'll') => (
  `${moment.unix(datetime).utcOffset(moment().utcOffset()).format(format)} ${moment.unix(datetime).utcOffset(moment().utcOffset()).format("LTS")}`
)

export const formatDatetimeAgo = (datetime) => (
  moment.utc(datetime).utcOffset(moment().utcOffset()).fromNow()
)

export const getDiffInSeconds = (datetime) => (
  moment().diff(moment.unix(datetime), 'seconds')
)
