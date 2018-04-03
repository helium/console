let sitekey

if (process.env.NODE_ENV === "development") {
  sitekey = "6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5"
} else {
  sitekey = "6LdqwFAUAAAAAJ8_ili9I1J_Yga3SO35VrIFNqHE"
}

const config = {
  recaptcha: {
    sitekey
  }
}

export default config
