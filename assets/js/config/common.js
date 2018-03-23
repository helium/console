let sitekey

if (process.env.NODE_ENV === "development") {
  sitekey = "6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5"
}

const config = {
  recaptcha: {
    sitekey
  }
}

export default config
