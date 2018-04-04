export const getTimeToExpiration = (apikey) => {
  return parseJwt(apikey).exp - Math.floor(Date.now()/1000)
}

export const isJwtExpired = (apikey) => {
  return getTimeToExpiration(apikey) <= 0
}

export const getTeamId = (apikey) => {
  return parseJwt(apikey).team
}

export const parseJwt = (token) => {
  var base64Url = token.split('.')[1]
  var base64 = base64Url.replace('-', '+').replace('_', '/')
  return JSON.parse(window.atob(base64))
}
