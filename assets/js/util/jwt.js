export const isJwtExpired = (apikey) => {
  return getTimeToExpiration(apikey) <= 0
}

export const getTeamId = (apikey) => {
  return parseJwt(apikey).team
}

export const percentOfTimeLeft = (apikey) => {
  const timeToExpiration = getTimeToExpiration(apikey)
  const timeToLive = getTimeToLive(apikey)
  return timeToExpiration / timeToLive
}

export const parseJwt = (token) => {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace('-', '+').replace('_', '/')
  return JSON.parse(window.atob(base64))
}

const getTimeToExpiration = (apikey) => {
  return parseJwt(apikey).exp - Math.floor(Date.now()/1000)
}

const getTimeToLive = (apikey) => {
  const token = parseJwt(apikey)
  return token.exp - token.iat
}
