import moment from 'moment'

export const formatDatetime = (datetime, format = 'LLL') => (
  moment.utc(datetime).utcOffset(moment().utcOffset()).format(format)
)

export const formatUnixDatetime = (datetime, format = 'LLL') => (
  moment.unix(datetime).utcOffset(moment().utcOffset()).format(format)
)

export const formatDatetimeAgo = (datetime) => (
  moment.utc(datetime).utcOffset(moment().utcOffset()).fromNow()
)

export const getDiffInSeconds = (datetime) => (
  moment().diff(moment.unix(datetime), 'seconds')
)
