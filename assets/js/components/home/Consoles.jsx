import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "../../../img/mobile/logo.svg";
import { ProviderList } from "./ProviderList";
import styles from "./consoles.module.css";

export const Consoles = () => (
  <div className={styles.wrapper}>
    <div className={styles.bodyWrapper}>
      <div className={styles.body}>
        <div className={styles.nav}>
          <img className={styles.logo} src={Logo} />
          <NavLink className={styles.legacyLink} to="/login">
            Login to Legacy
          </NavLink>
        </div>
        <div className={styles.onboard}>
          <h1 className={styles.header}>Onboard a device</h1>
          <p className={styles.text}>
            The Helium ecosystem supports multiple network operators as well as
            the ability to run your own LoRaWAN Network Server.
          </p>
          <div className={styles.buttonWrapper}>
            <a
              className={styles.button}
              href="https://docs.helium.com/iot/find-a-lns-provider"
            >
              <span className={styles.buttonText}>Use an existing LNS</span>
            </a>
            <a
              className={styles.button}
              href="https://docs.helium.com/iot/run-an-lns"
            >
              <span className={styles.buttonText}>Run your own LNS</span>
            </a>
          </div>
        </div>

        {false && (
          <div className={styles.bottom}>
            <p className={styles.text}>
              Still testing things out? Try onboarding a device below:{" "}
              <a className={styles.devicePortal} href="https://helium.com">
                Onboard in Device Portal
              </a>
            </p>
          </div>
        )}
        {/* delete below when add device portal */}
        <div></div>
      </div>
    </div>
    <div className={styles.consoles}>
      <ProviderList />
    </div>
  </div>
);
