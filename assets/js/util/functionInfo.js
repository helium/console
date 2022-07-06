import FilledFunctionIcon from "../../img//functions/community/default.svg";

export const getAllowedFunctions = () => {
  const convertToList = (str) => {
    return str.replaceAll(" ", "").replace(/(^,+)|(,+$)/g, '').split(',').reduce((acc, curr) => {
      acc[curr] = true
      return acc
    }, {})
  }

  if (window.allowed_functions && window.allowed_functions !== "all") {
    return convertToList(window.allowed_functions)
  }
  if (process.env.ALLOWED_FUNCTIONS && process.env.ALLOWED_FUNCTIONS !== "all") {
    return convertToList(process.env.ALLOWED_FUNCTIONS)
  }
  return [...CORE_FUNCTION_FORMATS, ...COMMUNITY_FUNCTION_FORMATS].reduce((acc, i) => {
    acc[i.format] = true
    return acc
  }, {})
}

export const CORE_FUNCTION_FORMATS = [
  {
    name: "Custom",
    format: "custom",
    img: `${FilledFunctionIcon}`,
  }
];

export const COMMUNITY_FUNCTION_FORMATS = [
  {
    name: "Cayenne LPP",
    format: "cayenne",
    img: `${FilledFunctionIcon}`,
  },
  {
    name: "Browan Object Locator",
    format: "browan_object_locator",
    img: `${FilledFunctionIcon}`,
  }
];

export const functionFormats = [...CORE_FUNCTION_FORMATS, ...COMMUNITY_FUNCTION_FORMATS].reduce((acc, f) => {
  acc[f.format] = f.name
  return acc
}, {})

export const functionTypes = {
  decoder: "Decoder"
}
