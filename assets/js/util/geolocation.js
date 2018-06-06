export const parseLocation = (location) => {
  if (location == "unknown_location" || location == "api_call_failed") {
    return "Location Unavailable"
  } else {
    return location
  }
}
