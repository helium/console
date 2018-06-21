import React, { Component } from 'react'
import Mapbox from '../common/Mapbox'

// GraphQL
import { graphql } from 'react-apollo';
import { PAGINATED_GATEWAYS, GATEWAY_ADDED_SUBSCRIPTION } from '../../graphql/gateways'

// TODO we're only fetching the first 100 gateways for this map...
const queryOptions = {
  options: props => {
    const variables = {
      page: 1,
      pageSize: 100,
    }
    return {
      fetchPolicy: 'network-only',
      variables
    }
  }
}

@graphql(PAGINATED_GATEWAYS, queryOptions)
class GatewaysMap extends Component {
  componentDidMount() {
    const { subscribeToMore, fetchMore } = this.props.data

    subscribeToMore({
      document: GATEWAY_ADDED_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        fetchMore({
          variables: {},
          updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
        })
      }
    })
  }

  render() {
    const { loading, gateways } = this.props.data

    if (loading) return null

    return (
      <Mapbox type="gateways" view="index" gateways={gateways.entries} />
    )
  }
}

export default GatewaysMap
