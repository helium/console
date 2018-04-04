import generate from 'project-name-generator'

export const randomMac = () => {
  const hexDigits = "0123456789ABCDEF";
  let macAddress = "";
  for (var i = 0; i < 6; i++) {
    macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
    macAddress+=hexDigits.charAt(Math.round(Math.random() * 15));
  }

  return macAddress;
}

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


export const randomName = () => {
  return toTitleCase(generate().spaced)
}

const getRandomFloat = (min, max) => {
  return Math.random() * (max - min) + min
}

export const randomLatitude = () => {
  return getRandomFloat(24.7433195, 49.3457868)
}

export const randomLongitude = () => {
  return getRandomFloat(-124.7844079, -66.9513812)
}
