import React, { Component } from "react";
import FunctionDashboardLayout from "./FunctionDashboardLayout";
import { MobileDisplay, DesktopDisplay } from '../mobile/MediaQuery'
import { minWidth } from "../../util/constants";
import _JSXStyle from "styled-jsx/style";

class FunctionHome extends Component {
  render() {
    return (
      <>
        <MobileDisplay />
        <DesktopDisplay>
          <FunctionDashboardLayout {...this.props}>
            <div
              className="blankstateWrapper no-scroll-bar"
              style={{ overflowX: "scroll" }}
            >
              <div className="message" style={{ minWidth }}>
                <h1>Functions</h1>

                <div className="explainer">
                  <p>
                    Functions are operators that act on the data of its linked
                    devices and labels.
                  </p>
                  <p>
                    <a
                      className="help-link"
                      href="https://docs.helium.com/use-the-network/console/functions/"
                      target="_blank"
                    >
                      Learn more about Functions
                    </a>
                  </p>
                </div>
              </div>
              <style jsx>{`
                .message {
                  width: 100%;
                  max-width: 500px;
                  margin: 0 auto;
                  text-align: center;
                }
                .explainer {
                  padding: 20px 60px 1px 60px;
                  border-radius: 20px;
                  text-align: center;
                  margin-top: 20px;
                  box-sizing: border-box;
                  border: none;
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
                  margin-top: 10px;
                }
                p {
                  font-size: 20px;
                  font-weight: 300;
                  margin-bottom: 10px;
                }
              `}</style>
            </div>
          </FunctionDashboardLayout>
        </DesktopDisplay>
      </>
    );
  }
}

export default FunctionHome;
