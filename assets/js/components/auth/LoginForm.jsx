// import React from 'react';
//
// const LoginForm = (props) => {
//   const {email, password}
//   return (
//     <form onSubmit={this.handleSubmit}>
//       <TextField
//         type="email"
//         label="Email"
//         name="email"
//         value={this.state.email}
//         onChange={this.handleInputUpdate}
//         fullWidth
//       />
//
//       <TextField
//         type="password"
//         label="Password"
//         name="password"
//         value={this.state.password}
//         onChange={this.handleInputUpdate}
//         fullWidth
//       />
//
//       <Typography component="p">
//         <Link to="/forgot_password">Forgot password?</Link>
//       </Typography>
//
//       <Recaptcha
//         ref={e => this.recaptchaInstance = e}
//         sitekey={config.recaptcha.sitekey}
//         verifyCallback={this.verifyRecaptcha}
//         style={{marginTop: 24}}
//       />
//
//       {#<{(| <CardActions> |)}>#}
//       <Button
//         type="submit"
//         variant="raised"
//         color="primary"
//         size="large"
//       >
//         Sign In
//       </Button>
//     {#<{(| </CardActions> |)}>#}
//     </form>
//   )
// }
