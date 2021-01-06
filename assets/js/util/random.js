const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

export const randomFloat = (min, max) => {
  return Math.random() * (max - min) + min
}

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomLatitude = () => {
  return randomFloat(24.7433195, 49.3457868)
}

export const randomLongitude = () => {
  return randomFloat(-124.7844079, -66.9513812)
}
