import React, {Component} from 'react';

let interval
const waitForRecaptcha = new Promise(resolve=> {
  interval = setInterval(()=> {
    if (typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined') {
        clearInterval(interval);
        resolve(window.grecaptcha);
    }
  }, 200);
});

export default class Recaptcha extends Component {
    constructor(props) {
      super(props);
      this.state = {widget: null};
      this._containerRef = null;
    }

    componentDidMount() {
      this._renderGrecaptcha();
    }

    componentWillUnmount() {
      clearInterval(interval)
    }

    _renderGrecaptcha() {
      const {sitekey, verifyCallback} = this.props;
      const theme = 'light'
      const type = 'image'
      const size = 'normal'
      const tabindex = '0'
      const hl = 'en'
      const badge = 'bottomright'

      waitForRecaptcha.then(grecaptcha => {
        const widget = grecaptcha.render(this._containerRef, {
            sitekey, theme, type, size, tabindex, hl, badge,
            callback: verifyCallback
        });
        this.setState({widget});
      });
    }

    reset() {
      if (this.state.widget !== null) {
        grecaptcha.reset(this.state.widget);
      }
    }

    render() {
      return <div ref={el=> this._containerRef = el} />;
    }
}
