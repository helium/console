import React from "react";
import { Typography } from "antd";
const { Text } = Typography;
import UnselectedFlag from "../../../img/coverage/unselected-flag.svg";
import SelectedFlag from "../../../img/coverage/selected-flag.svg";
import PreferredFlag from "../../../img/coverage/preferred-flag.svg";
import Arrow from "../../../img/coverage/arrow.svg";

const styles = {
  flag: {
    height: 16,
    marginRight: 8,
  },
  arrow: {
    height: 8,
    marginRight: 8,
  },
  container: {
    backgroundColor: "#F5F7F9",
    borderRadius: 5,
    marginTop: 15,
    padding: 12,
  },
  text: { marginLeft: 12, color: "#91A4B7" },
};

export default () => (
  <div style={{ ...styles.container }}>
    <img draggable="false" src={UnselectedFlag} style={{ ...styles.flag }} />
    <img draggable="false" src={Arrow} style={{ ...styles.arrow }} />
    <img draggable="false" src={SelectedFlag} style={{ ...styles.flag }} />
    <img draggable="false" src={Arrow} style={{ ...styles.arrow }} />
    <img draggable="false" src={PreferredFlag} style={{ ...styles.flag }} />
    <img draggable="false" src={Arrow} style={{ ...styles.arrow }} />
    <img draggable="false" src={UnselectedFlag} style={{ ...styles.flag }} />
    <Text style={{ ...styles.text }}>Cycle through Preferral Modes</Text>
  </div>
);
