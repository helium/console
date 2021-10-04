import Fuse from "fuse.js";
import take from "lodash/take";

const pages = [
  {
    title: "Devices",
    description: "View and manage devices",
    url: "/devices",
    id: "/devices",
    category: "devices",
    synonyms: "",
  },
  {
    title: "Integrations",
    description: "View and manage integrations",
    url: "/integrations",
    id: "/integrations",
    category: "integrations",
    synonyms: "",
  },
  {
    title: "Functions",
    description: "View and manage functions",
    url: "/functions",
    id: "/functions",
    category: "functions",
    synonyms: "",
  },
  {
    title: "Organizations",
    description: "Manage multiple organization access",
    url: "/organizations",
    id: "/organizations",
    category: "organizations",
    synonyms: "",
  },
  {
    title: "Users",
    description: "Manage organization member access",
    url: "/users",
    id: "/users",
    category: "users",
    synonyms: "",
  },
  {
    title: "Data Credits",
    description: "Manage your data credits",
    url: "/datacredits",
    id: "/datacredits",
    category: "datacredits",
    synonyms: "billing",
  },
  {
    title: "Profile",
    description: "Configure your account settings",
    url: "/profile",
    id: "/profile",
    category: "profile",
    synonyms: "account",
  },
  {
    title: "Alerts",
    description: "Configure your alerts",
    url: "/alerts",
    id: "/alerts",
    category: "alerts",
    synonyms: "notifications",
  },
  {
    title: "Multiple Packets",
    description: "Configure your packet purchase settings",
    url: "/multi_buys",
    id: "/multi_buys",
    category: "multibuys",
    synonyms: "packets",
  },
  {
    title: "Configuration Profiles",
    description: "Set up your configuration profiles",
    url: "/config_profiles",
    id: "/config_profiles",
    category: "configprofiles",
    synonyms: "profiles",
  },
  {
    title: "Flows",
    description: "Configure your data flows",
    url: "/flows",
    id: "/flows",
    category: "flows",
    synonyms: "",
  },
];

const fuseOpts = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["title", "synonyms"],
};

const fuse = new Fuse(pages, fuseOpts);

const searchPages = (query) => take(fuse.search(query), 5);

export default searchPages;
