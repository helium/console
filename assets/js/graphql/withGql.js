import React from 'react'
import { useQuery } from '@apollo/client';

const withGql = (Component, query, queryOptions) => {
  return (props) => {
    const queryProps = useQuery(query, queryOptions)

    return (
      <Component {...props} {...{ [queryOptions.name]: queryProps }} />
    )
  }
}

export default withGql
