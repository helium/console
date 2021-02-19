import React from 'react'
import { useQuery } from '@apollo/client';

const withGql = (Component, query, queryOptionsFunc) => {
  return (props) => {
    const queryOptions = queryOptionsFunc(props)
    const queryProps = useQuery(query, queryOptions)

    return (
      <Component {...props} {...{ [queryOptions.name]: Object.assign({}, queryProps, queryProps.data) }}  />
    )
  }
}

export default withGql
