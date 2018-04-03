const setConfig = (env) => {
  switch(env) {
    case "development":
      return {
        recaptcha: {
          sitekey: "6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5"
        }
      }
    case "production":
      return {
        recaptcha: {
          sitekey: "6LdqwFAUAAAAAJ8_ili9I1J_Yga3SO35VrIFNqHE"
        }
      }
    default:
      return {}
  }
}

const config = setConfig(process.env.NODE_ENV)

export default config
