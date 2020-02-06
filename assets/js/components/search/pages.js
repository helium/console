import Fuse from "fuse.js"
import take from 'lodash/take'

const pages = [
  {
    title: "Dashboard",
    description: "See everything at a glance",
    url: "/dashboard",
    id: "/dashboard",
    category: "dashboard",
    synonyms: ""
  },
  {
    title: "Devices",
    description: "View and manage devices",
    url: "/devices",
    id: "/devices",
    category: "devices",
    synonyms: ""
  },
  {
    title: "Integrations",
    description: "View and manage integrations",
    url: "/integrations",
    id: "/integrations",
    category: "integrations",
    synonyms: ""
  },
  {
    title: "New Azure IoT Hub",
    description: "Create a new Azure integration",
    url: "/integrations/new/azure",
    id: "/integrations/new/azure",
    category: "integrations",
    synonyms: ""
  },
  {
    title: "New AWS IoT",
    description: "Create a new AWS integration",
    url: "/integrations/new/aws",
    id: "/integrations/new/aws",
    category: "integrations",
    synonyms: ""
  },
  {
    title: "New Google Cloud IoT",
    description: "Create a new Google integration",
    url: "/integrations/new/google",
    id: "/integrations/new/google",
    category: "integrations",
    synonyms: ""
  },
  {
    title: "New MQTT",
    description: "Create a new MQTT integration",
    url: "/integrations/new/mqtt",
    id: "/integrations/new/mqtt",
    category: "integrations",
    synonyms: ""
  },
  {
    title: "New HTTP",
    description: "Create a new HTTP integration",
    url: "/integrations/new/http",
    id: "/integrations/new/http",
    category: "integrations",
    synonyms: ""
  },
  {
    title: "Users",
    description: "Manage organization member access",
    url: "/users",
    id: "/users",
    category: "users",
    synonyms: "organization"
  },
  {
    title: "Profile",
    description: "Configure your account settings",
    url: "/profile",
    id: "/profile",
    category: "profile",
    synonyms: "account"
  },
  {
    title: "Data Credits",
    description: "Manage your data credits",
    url: "/datacredits",
    id: "/datacredits",
    category: "datacredits",
    synonyms: "billing"
  },
]

const fuseOpts = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "title",
    "synonyms"
  ]
}

const fuse = new Fuse(pages, fuseOpts)

const searchPages = (query) => take(fuse.search(query), 5)

export default searchPages
