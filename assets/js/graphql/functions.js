import gql from 'graphql-tag';

export const FUNCTION_FRAGMENT = gql`
  fragment FunctionFragment on Function {
    id,
    name,
    body,
    type,
    format,
    active,
    labels {
      id,
      name,
      color,
      channels {
        name,
        id,
      }
    }
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

export const FUNCTION_SUBSCRIPTION = gql`
  subscription onFunctionAdded {
    functionAdded {
      ...FunctionFragment
    }
  }
  ${FUNCTION_FRAGMENT}
`

export const FUNCTION_UPDATE_SUBSCRIPTION = gql`
  subscription onFunctionUpdated($functionId: String) {
    functionUpdated(functionId: $functionId) {
      name
    }
  }
`
