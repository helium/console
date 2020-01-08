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
    title: "Channels",
    description: "View and manage channels",
    url: "/channels",
    id: "/channels",
    category: "channels",
    synonyms: ""
  },
  {
    title: "New Azure IoT Hub",
    description: "Create a new Azure channel",
    url: "/channels/new/azure",
    id: "/channels/new/azure",
    category: "channels",
    synonyms: ""
  },
  {
    title: "New AWS IoT",
    description: "Create a new AWS channel",
    url: "/channels/new/aws",
    id: "/channels/new/aws",
    category: "channels",
    synonyms: ""
  },
  {
    title: "New Google Cloud IoT",
    description: "Create a new Google channel",
    url: "/channels/new/google",
    id: "/channels/new/google",
    category: "channels",
    synonyms: ""
  },
  {
    title: "New MQTT Channel",
    description: "Create a new MQTT channel",
    url: "/channels/new/mqtt",
    id: "/channels/new/mqtt",
    category: "channels",
    synonyms: ""
  },
  {
    title: "New HTTP Channel",
    description: "Create a new HTTP channel",
    url: "/channels/new/http",
    id: "/channels/new/http",
    category: "channels",
    synonyms: ""
  },
  {
    title: "Users",
    description: "Manage team member access",
    url: "/teams/users",
    id: "/teams/users",
    category: "users",
    synonyms: "team"
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
  // {
  //   title: "Reports",
  //   description: "View and export enterprise reports",
  //   url: "/reports",
  //   id: "/reports",
  //   category: "reports",
  //   synonyms: ""
  // },
  // {
  //   title: "Notifications",
  //   description: "View all active and past notifications",
  //   url: "/notifications",
  //   id: "/notifications",
  //   category: "notifications",
  //   synonyms: ""
  // },
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
