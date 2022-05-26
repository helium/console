import React from "react";
import { useSelector } from "react-redux";
import { Layout } from "antd";
const { Footer } = Layout;

export default () => {
  const appConfig = useSelector((state) => state.appConfig);
  const { footer } = appConfig

  const renderMainLink = () => {
    if (footer && footer.mainLink) {
      return (
        <a
          href={footer.mainLink.url}
          style={{
            color: "#556B8C",
            marginRight: "25px",
            fontWeight: "bold",
          }}
        >
          {footer.mainLink.text}
        </a>
      )
    }
    return (
      <a
        href={`https://${window.env_domain || process.env.ENV_DOMAIN}`}
        style={{
          color: "#556B8C",
          marginRight: "25px",
          fontWeight: "bold",
        }}
      >
        {window.env_domain || process.env.ENV_DOMAIN}
      </a>
    )
  }

  const renderLinks = () => {
    if (footer && footer.links && footer.links.length > 0) {
      return footer.links.map((link) => (
        <a
          key={link.text}
          href={link.url}
          target="_blank"
          style={{ color: "#556B8C", marginRight: "20px" }}
        >
          {link.text}
        </a>
      ))
    }
    return (
      [
        {
          text: "Documentation & Tutorials",
          url: "https://docs.helium.com/use-the-network/console",
        },
        {
          text: "How-to Videos",
          url: "https://www.youtube.com/playlist?list=PLtKQNefsR5zNjWkXqdRXeBbSmYWRJFCuo",
        },
        {
          text: "Community Discord",
          url: "http://chat.helium.com",
        },
        {
          text: "Engineering Blog",
          url: "http://engineering.helium.com",
        },
        { text: "Terms & Conditions", url: "/terms" },
      ].map((link) => (
        <a
          key={link.text}
          href={link.url}
          target="_blank"
          style={{ color: "#556B8C", marginRight: "20px" }}
        >
          {link.text}
        </a>
      ))
    )
  }

  const renderCopyright = () => {
    if (footer && footer.copyright) {
      return (
        <div style={{ marginLeft: "auto" }}>
          {footer.copyright}
        </div>
      )
    }
    return (
      <div style={{ marginLeft: "auto" }}>
        © 2022 Helium Foundation
      </div>
    )
  }
  return (
    <Footer
      className="no-scroll-bar"
      style={{
        flexShrink: "0",
        padding: "10px 10px",
        marginBottom: "-150px",
        overflowX: "scroll",
      }}
    >
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          minWidth: 700,
        }}
      >
        {renderMainLink()}
        {renderLinks()}
        {renderCopyright()}
      </div>
    </Footer>
  );
}
