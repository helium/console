import { gql } from "@apollo/client";

export const GET_VETTED_USER_STATUS = gql`
  query VettedUserStatusQuery($email: String!) {
    vettedUserStatus(email: $email) {
      vetted
    }
  }
`;
