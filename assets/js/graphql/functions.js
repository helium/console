import gql from 'graphql-tag';

export const FUNCTION_FRAGMENT = gql`
  fragment FunctionFragment on Function {
    id,
    name,
    body,
    type,
    format,
    active
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

export const FUNCTION_SUBSCRIPTION = gql`
  subscription onFunctionAdded {
    functionAdded {
      ...FunctionFragment
    }
  }
  ${FUNCTION_FRAGMENT}
`
