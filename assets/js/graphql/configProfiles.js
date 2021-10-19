import { gql } from "@apollo/client";

const CONFIG_PROFILE_FRAGMENT = gql`
  fragment ConfigProfileFragment on ConfigProfile {
    id
    name
    adr_allowed
    cf_list_enabled
    devices {
      id
      name
    }
    labels {
      id
      name
    }
  }
`;

export const CONFIG_PROFILE_SHOW = gql`
  query ConfigProfileShowQuery($id: ID!) {
    configProfile(id: $id) {
      ...ConfigProfileFragment
    }
  }
  ${CONFIG_PROFILE_FRAGMENT}
`;

export const ALL_CONFIG_PROFILES = gql`
  query AllConfigProfilesQuery {
    allConfigProfiles {
      ...ConfigProfileFragment
    }
  }
  ${CONFIG_PROFILE_FRAGMENT}
`;
