import React from "react";
import styles from "./ConsoleList.module.css";
import consoles from "./consoles.json";

const serverTypeToStyle = {
  Shared: styles.serverShared,
  Private: styles.serverPrivate,
  Public: styles.serverPublic,
};

export const ConsoleList = () => {
  return (
    <div className={styles.wrapper}>
      {consoles.map((console) => (
        <a
          key={console.name}
          href={console.url}
          className={styles.consoleWrapper}
        >
          <img src={console.logo} className={styles.logo}></img>
          <div className={styles.servers}>
            <div>
              <h5 className={styles.header}>Service Region</h5>
              <p className={styles.bigText}>
                {console.serviceRegion.join(", ")}
              </p>
            </div>
            <div>
              <h5 className={styles.header}>PUBLIC SERVER LOC.</h5>
              <p className={styles.bigText}>
                {console.serverLocation.join(", ")}
              </p>
            </div>
          </div>
          <div>
            <h5 className={styles.header}>Servers</h5>
            <div className={styles.serverTypes}>
              {console.serverType.map((type) => (
                <div
                  key={type}
                  className={serverTypeToStyle[type] || styles.serverPublic}
                >
                  <p className={styles.serverTypeText}>{type}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.pricing}>
            <h5 className={styles.header}>PRICING MODEL</h5>
            <p className={styles.text}>{console.pricingModel}</p>
          </div>
        </a>
      ))}
    </div>
  );
};
