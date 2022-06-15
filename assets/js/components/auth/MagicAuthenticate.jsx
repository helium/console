import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Card, Typography, Input, Form } from 'antd';
import GoogleOutlined from "@ant-design/icons/GoogleOutlined";
import { loginUser, loginGoogleUser } from '../../actions/magic';
import AuthLayout from '../common/AuthLayout'
import Logo from '../../../img/symbol.svg'
import * as rest from '../../util/rest';
import { displayError } from '../../util/messages';
const { Text, Title } = Typography

const MagicAuthenticate = () => {
  const history = useHistory()
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState('');
  const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY || '6Len2logAAAAALaqL5cECU0Vl7JJqqbIQX6IgWz6'
  const useRecaptchaForAuth = true  // set to true here to test recaptcha in dev

  useEffect(() => {
    const loadScriptByURL = (id, url, callback) => {
      const isScriptExist = document.getElementById(id);

      if (!isScriptExist) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = url;
        script.id = id;
        script.onload = function () {
          if (callback) callback();
        };
        document.body.appendChild(script);
        return
      }

      if (isScriptExist && callback) return callback();
    }

    if (useRecaptchaForAuth) {
      loadScriptByURL("recaptcha-key", `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`);
    }
  }, []);

  const handleRecaptchaSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    if (!email) {
      setLoading(false);
      displayError('Email is Invalid');
      return;
    }

    if (!window.grecaptcha || (useRecaptchaForAuth && !recaptchaSiteKey)) {
      setLoading(false);
      displayError('Google Recaptcha failed to load properly, please refresh the page and try again');
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(recaptchaSiteKey, { action: 'submit' }).then(token => {
        return fetch('/api/sessions/verify_recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: `{"token":"${token}"}`
        })
        .then(data => data.json())
        .then(data => {
          if (data.success && data.score >= 0.9) {
            handleEmailSubmit()
          } else {
            displayError('Unable to log in, please contact the admin');
          }
        })
      })
      .catch(() => {
        setLoading(false);
        displayError('Google Recaptcha failed to verify properly, please refresh the page and try again');
      })
    })
  }

  const handleEmailSubmit = () => {
    try {
      loginUser(email);
    } catch (error) {
      setError('Unable to log in');
      console.error(error);
    }
  };

  const handleGoogleSubmit = () => {
    const { pathname, search } = history.location

    if (pathname === '/join_organization' && search.substring(0, 12) === '?invitation=') {
      localStorage.setItem('post-google-auth-redirect', pathname + search);
    }
    loginGoogleUser()
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const appName = useSelector((state) => state.appConfig.appName);
  const mainLogo = useSelector((state) => state.appConfig.mainLogo);

  return (
    <AuthLayout>
      <Card style={{padding: 30, borderRadius: 20, boxShadow: '0 52px 64px -50px #001529'}}>
        <img src={mainLogo || Logo} style={{width: 70, display: "block", margin:'0 auto', marginBottom: 20}} />
        {
          process.env.ENV_DOMAIN === 'console.helium.com' ? (
            <div style={{textAlign: 'center', marginBottom: 30}}>
              <Title>
                Helium Console: Foundation
              </Title>
              <Text style={{ display: 'block' }}>
                Submit your email address to receive a login link and learn about the network (10 device limit).
              </Text>
              <Text style={{ display: 'block', marginTop: 4 }}>
                For larger deployments,{' '}
                <a target="_blank" href="https://docs.helium.com/use-the-network/console/hosting-providers/">
                  check providers here
                </a>
                .
              </Text>
            </div>
          ) : (
            <div style={{textAlign: 'center', marginBottom: 30}}>
              <Title>
                { appName || "Helium Console" }
              </Title>
              <Text style={{color:'#38A2FF'}}>Submit your email address to receive a login link</Text>
            </div>
          )
        }

        <Form
          onSubmit={e => {
            if (useRecaptchaForAuth) {
              handleRecaptchaSubmit(e)
            } else {
              handleEmailSubmit()
            }
          }}
        >
          <Form.Item style={{marginBottom: 4}}>
            <Input
              autoFocus
              placeholder="Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{ width: '100%' }}
            onClick={e => {
              if (useRecaptchaForAuth) {
                handleRecaptchaSubmit(e)
              } else {
                handleEmailSubmit()
              }
            }}
          >
            {loading ? 'Loading...' : 'Submit'}
          </Button>
        </Form>

        <Button
          htmlType="submit"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleGoogleSubmit}
        >
          <GoogleOutlined />
          <span style={{ marginLeft: 6 }}>Continue with Google</span>
        </Button>
      </Card>
    </AuthLayout>
  )
};

export default MagicAuthenticate
