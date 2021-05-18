import React from "react";

export default (props) => {
  return (
    <div
      style={{
        backgroundColor: props.backgroundColor,
        borderRadius: "30px",
        padding: "5px 10px 5px 10px",
        cursor: "pointer",
        height: 50,
        width: 150,
        display: "flex",
        flexDirection: "column",
        marginRight: props.margin,
        position: "relative",
        color: "white",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: 500,
      }}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
};
