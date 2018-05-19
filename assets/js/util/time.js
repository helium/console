import moment from 'moment'

export const formatDatetime = (datetime, format = 'LLL') => (
  moment.utc(datetime).utcOffset(moment().utcOffset()).format(format)
)
