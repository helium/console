const setConfig = (env) => {
  switch(env) {
    case "production":
      return {
        recaptcha: {
          sitekey: "6LdqwFAUAAAAAJ8_ili9I1J_Yga3SO35VrIFNqHE"
        }
      }
    default:
      return {
        recaptcha: {
          sitekey: "6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5"
        }
      }
  }
}

const config = setConfig(process.env.REACT_ENV)

export default config
