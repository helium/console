import axios from "axios";
import React, { useEffect, useState } from "react";
import { displayError } from "../../util/messages";
import styles from "./ConsoleList.module.css";

const serverTypeToStyle = {
  Shared: styles.serverShared,
  Private: styles.serverPrivate,
  Public: styles.serverPublic,
};

export const ConsoleList = () => {
  const [lnsList, setLnsList] = useState([]);
  useEffect(() => {
    const fetchLnsList = async () => {
      try {
        const list = await axios(
          "https://raw.githubusercontent.com/helium/well-known/c387377af76fd7040dc0786f0aa9fa15054f8598/lists/consoles/consoles.json"
        );
        setLnsList(list.data);
      } catch (error) {
        displayError(error);
      }
    };
    fetchLnsList();
  }, []);

  return (
    <div className={styles.wrapper}>
      {lnsList.map((console) => (
        <a
          key={console.name}
          href={console.url}
          className={styles.consoleWrapper}
        >
          <div className={styles.logoWrapper}>
            <img src={console.logo} className={styles.logo}></img>
          </div>
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
