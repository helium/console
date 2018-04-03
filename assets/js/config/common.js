let sitekey

if (process.env.REACT_ENV === "production") {
  sitekey = "6LdqwFAUAAAAAJ8_ili9I1J_Yga3SO35VrIFNqHE"
} else {
  sitekey = "6Lew200UAAAAACN3_-tS_UvTcnhF2mlZCzzQ4Na5"
}

const config = {
  recaptcha: {
    sitekey
  }
}

export default config
