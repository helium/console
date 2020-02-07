import gql from 'graphql-tag';

export const LABEL_FRAGMENT = gql`
  fragment LabelFragment on Label {
    name,
    id,
    inserted_at,
  }
`

export const PAGINATED_LABELS = gql`
  query PaginatedLabelsQuery ($page: Int, $pageSize: Int) {
    labels(page: $page, pageSize: $pageSize) {
      entries {
        ...LabelFragment
      },
      totalEntries,
      totalPages,
      pageSize,
      pageNumber
    }
  }
  ${LABEL_FRAGMENT}
`
