import React from "react";
import { Link } from "react-router-dom";
import FunctionTypeTile from './FunctionTypeTile'
import { Typography, Card, Button, Input, Select } from "antd";
import { minWidth } from "../../util/constants";
import { getAllowedFunctions, CORE_FUNCTION_FORMATS, COMMUNITY_FUNCTION_FORMATS } from "../../util/functionInfo";
const { Text } = Typography;

const styles = {
  createRow: {
    display: "flex",
    justifyContent: "flex-start",
    width: "auto",
  },
  button: {
    textTransform: "none",
    textAlign: "center",
    minWidth: 140,
  },
  tile: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  icon: {
    height: 100,
    width: 100,
    marginBottom: 10,
  },
};

export default ({ allFunctions, selectFunctionFormat }) => {
  const allowedFunctions = getAllowedFunctions()
  return (
    <div style={{ padding: "30px 30px 20px 30px", minWidth }}>
      {
        CORE_FUNCTION_FORMATS.filter(i => allowedFunctions[i.format]).length > 0 && (
          <Card
            size="small"
            title="Add a Core Function"
            className="functioncard"
            bodyStyle={{ padding: 1 }}
          >
            <div
              style={{
                padding: 10,
                height: "100%",
                width: "100%",
                overflowX: "scroll",
              }}
            >
              <div style={styles.createRow}>
                {CORE_FUNCTION_FORMATS.filter(i => allowedFunctions[i.format]).map((func, i) => (
                  <div
                    className="wrapper"
                    style={styles.button}
                    key={func.name}
                  >
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        selectFunctionFormat(func.format);
                      }}
                    >
                      <FunctionTypeTile
                        tileStyle={styles.tile}
                        iconStyle={styles.icon}
                        img={func.img}
                        name={func.name}
                        type="Decoder"
                        count={(allFunctions && allFunctions.filter(f => f.format === func.format).length) || 0}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      }
      {
        COMMUNITY_FUNCTION_FORMATS.filter(i => allowedFunctions[i.format]).length > 0 && (
          <Card
            size="small"
            title="Add a Community Function"
            className="functioncard"
            bodyStyle={{ padding: 1 }}
          >
            <div
              style={{
                padding: 10,
                height: "100%",
                width: "100%",
                overflowX: "scroll",
              }}
            >
              <div style={styles.createRow}>
                {COMMUNITY_FUNCTION_FORMATS.filter(i => allowedFunctions[i.format]).map((func, i) => (
                  <div
                    className="wrapper"
                    style={styles.button}
                    key={func.name}
                  >
                    <Link
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        selectFunctionFormat(func.format);
                      }}
                    >
                      <FunctionTypeTile
                        tileStyle={styles.tile}
                        iconStyle={styles.icon}
                        img={func.img}
                        name={func.name}
                        type="Decoder"
                        count={(allFunctions && allFunctions.filter(f => f.format === func.format).length) || 0}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      }
      <style jsx>{`
        .wrapper {
          background: white;
          padding: 20px 10px 16px;
          border-radius: 20px;
          transition: all 0.2s ease;
        }

        .wrapper:hover {
          background: #f0f2f5;
          transition: all 0.2s ease;
        }

        .wrapper img {
          transform: scale(1);
          transition: all 0.2s ease;
        }

        .wrapper:hover img {
          transform: scale(1.03);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};
