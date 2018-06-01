import Fuse from "fuse.js"

const pages = [
  {
    title: "Dashboard",
    description: "See everything at a glance",
    url: "/dashboard",
    objectID: "/dashboard",
    icon: "dashboard",
    synonyms: ""
  },
  {
    title: "Devices",
    description: "View and manage devices",
    url: "/devices",
    objectID: "/devices",
    icon: "devices",
    synonyms: ""
  },
  {
    title: "Gateways",
    description: "View and manage gateways",
    url: "/gateways",
    objectID: "/gateways",
    icon: "gateways",
    synonyms: ""
  },
  {
    title: "Channels",
    description: "View and manage channels",
    url: "/channels",
    objectID: "/channels",
    icon: "channels",
    synonyms: ""
  },
  {
    title: "Access",
    description: "Manage team member access",
    url: "/teams/access",
    objectID: "/teams/access",
    icon: "access",
    synonyms: "team"
  },
  {
    title: "Profile",
    description: "Configure your account settings",
    url: "/profile",
    objectID: "/profile",
    icon: "profile",
    synonyms: "account"
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

const searchPages = (query) => fuse.search(query)

export default searchPages
