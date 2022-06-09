import React from "react";
import DCIMg from "../../../img/datacredits.svg";
import UserCan from "../common/UserCan";
import WalletOutlined from "@ant-design/icons/WalletOutlined";
import { Button } from "antd";
import _JSXStyle from "styled-jsx/style";

export default ({ organization, onClick }) => {
  const costMultiplier = window.dc_cost_multiplier || 1

  return (
    <div className="blankstateWrapper" style={{ paddingTop: "80px" }}>
      <div className="message">
        <img style={{ width: 100, marginBottom: 20 }} src={DCIMg} />
        <h1>Data Credits</h1>
        {
          (!process.env.SELF_HOSTED || window.stripe_public_key || window.disable_user_burn !== true) && (
            <React.Fragment>
              <UserCan noManager>
                <p style={{ fontSize: 16 }}>
                  Click here to purchase more Data Credits, set up an automatic
                  renewal, and monitor balances.
                </p>
              </UserCan>
              <UserCan noManager>
                <Button
                  size="large"
                  type="primary"
                  icon={<WalletOutlined />}
                  onClick={onClick}
                  style={{ borderRadius: 4 }}
                >
                  Purchase Data Credits
                </Button>
              </UserCan>
            </React.Fragment>
          )
        }

        <div className="explainer">
          <h2>What are Data Credits?</h2>
          <p>
            Data Credits are used by devices to send data via the Helium
            Network. The cost per fragment is ${0.00001 * costMultiplier} USD (fragments are 24
            bytes) which is equivalent to 1 Data Credit (DC).
          </p>
          <p>
            <a
              className="help-link"
              href="https://docs.helium.com/use-the-network/console/data-credits"
              target="_blank"
            >
              Learn more about Data Credits
            </a>
          </p>
        </div>
      </div>
      <style jsx>{`
        .message {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        .explainer {
          padding: 20px 60px;
          border-radius: 20px;
          text-align: center;
          margin-top: 50px;
          box-sizing: border-box;
          border: none;
          background: #f6f8fa;
        }

        .explainer h2 {
          color: #242424;
          font-size: 20px;
        }
        .explainer p {
          color: #565656;
          font-size: 15px;
        }

        .explainer p a {
          color: #096dd9;
        }

        h1,
        p {
          color: #242425;
        }
        h1 {
          font-size: 46px;
          margin-bottom: 10px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        p {
          font-size: 20px;
          font-weight: 300;
          margin: 0 auto;
          max-width: 500px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}
