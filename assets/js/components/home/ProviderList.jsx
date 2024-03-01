import axios from "axios";
import React, { useEffect, useState } from "react";
import { displayError } from "../../util/messages";
import styles from "./ProviderList.module.css";

const serverTypeToStyle = {
  Shared: styles.serverShared,
  Private: styles.serverPrivate,
  Public: styles.serverPublic,
};

export const ProviderList = () => {
  const [lnsProviders, setLnsProviders] = useState([]);
  useEffect(() => {
    const fetchLnsProviders = async () => {
      try {
        const list = await axios(
          "https://raw.githubusercontent.com/helium/well-known/main/lists/lns-providers/providers.json"
        );
        setLnsProviders(list.data);
      } catch (error) {
        displayError(error);
      }
    };
    fetchLnsProviders();
  }, []);

  return (
    <div className={styles.wrapper}>
      {lnsProviders.map((provider) => (
        <a
          key={provider.name}
          href={provider.url}
          className={styles.providerWrapper}
        >
          <div className={styles.logoWrapper}>
            <img
              src={provider.logoRaster || provider.logoVector}
              className={styles.logo}
            ></img>
          </div>
          <div className={styles.servers}>
            <div>
              <h5 className={styles.header}>Service Region</h5>
              <p className={styles.bigText}>
                {provider.serviceRegion.join(", ")}
              </p>
            </div>
            <div>
              <h5 className={styles.header}>PUBLIC SERVER LOC.</h5>
              <p className={styles.bigText}>
                {provider.serverLocation.join(", ")}
              </p>
            </div>
          </div>
          <div>
            <h5 className={styles.header}>Servers</h5>
            <div className={styles.serverTypes}>
              {provider.serverType.map((type) => (
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
            <p className={styles.text}>{provider.pricingModel}</p>
          </div>
        </a>
      ))}
    </div>
  );
};
