import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import lightBlue from '@material-ui/core/colors/lightBlue';
import blue from '@material-ui/core/colors/blue';
import pink from '@material-ui/core/colors/pink';
import CssBaseline from '@material-ui/core/CssBaseline';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      light: blue[300],
      main: blue[500],
      dark: blue[700],
    },
    secondary: pink,
    background: {
      default: '#ECEFF1'
    }
  },
});

function withTheme(Component) {
  function WithTheme(props) {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </MuiThemeProvider>
    );
  }

  return WithTheme;
}

export default withTheme;
