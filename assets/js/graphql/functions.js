import { gql } from '@apollo/client';

export const FUNCTION_FRAGMENT = gql`
  fragment FunctionFragment on Function {
    id,
    name,
    body,
    type,
    format,
    active,
  }
`

export const PAGINATED_FUNCTIONS = gql`
  query PaginatedFunctionsQuery ($page: Int, $pageSize: Int) {
    functions(page: $page, pageSize: $pageSize) {
      entries {
        ...FunctionFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${FUNCTION_FRAGMENT}
`

export const FUNCTION_SHOW = gql`
  query FunctionShowQuery ($id: ID!) {
    function(id: $id) {
      ...FunctionFragment
    }
  }
  ${FUNCTION_FRAGMENT}
`
