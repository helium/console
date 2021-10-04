import { gql } from "@apollo/client";

export const CONFIG_PROFILE_SHOW = gql`
  query ConfigProfileShowQuery($id: ID!) {
    configProfile(id: $id) {
      id
      name
      adr_allowed
      cf_list_enabled
    }
  }
`;

export const ALL_CONFIG_PROFILES = gql`
  query AllConfigProfilesQuery {
    allConfigProfiles {
      id
      name
      adr_allowed
      cf_list_enabled
    }
  }
`;
