import React, { Component } from 'react'
import { graphql } from 'react-apollo';
import moment from 'moment'
import numeral from 'numeral'
import get from 'lodash/get'
import PaymentCard from './PaymentCard'
import { PAGINATED_DC_PURCHASES, DC_PURCHASE_SUBSCRIPTION } from '../../graphql/dcPurchases'
import { Card, Typography, Table, Pagination, Icon } from 'antd';
const { Text } = Typography

const styles = {
  icon: {
    fontSize: 12,
    color: '#2BE5A2',
    marginRight: 5
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      page: 1,
      pageSize: 10,
    },
    fetchPolicy: 'cache-and-network',
  })
}

@graphql(PAGINATED_DC_PURCHASES, queryOptions)
class DataCreditPurchasesTable extends Component {
  state = {
    page: 1,
    pageSize: get(this.props.data, ['variables', 'pageSize']) || 10,
  }

  componentDidMount() {
    const { subscribeToMore} = this.props.data
    const { page, pageSize } = this.state

    subscribeToMore({
      document: DC_PURCHASE_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        this.refetchPaginatedEntries(page, pageSize)
      }
    })
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { fetchMore } = this.props.data
    fetchMore({
      variables: { page, pageSize },
      updateQuery: (prev, { fetchMoreResult }) => fetchMoreResult
    })
  }

  render() {
    const columns = [
      {
        title: 'Data Credits',
        dataIndex: 'dc_purchased',
        render: data => "+" + numeral(data).format('0,0'),
      },
      // {
      //   title: 'Cost',
      //   dataIndex: 'cost',
      //   render:  (data, record) => {
      //     if (record.card_type == "burn") {
      //       return data + " HNT"
      //     } else {
      //       return "$ " + (data / 100).toFixed(2)
      //     }
      //   }
      // },
      {
        title: 'From/To',
        dataIndex: 'payment_id',
        render:  (data, record) => {
          if (record.card_type == "burn") {
            return <Text><Icon style={styles.icon} type="caret-left" />{"MEMO: " + data}</Text>
          } else if (record.card_type == "transfer"){
            return
          } else {
            return <Text><Icon style={styles.icon} type="caret-left" />{data.slice(3)}</Text>
          }
        }
      },
      {
        title: 'Handled By',
        dataIndex: 'user_id',
      },
      {
        title: 'Transfer Method',
        dataIndex: 'last_4',
        render: (text, record) => {
          if (record.card_type == "burn") {
            return "-"
          } else if (record.card_type == "transfer"){
            return "DC Transfer"
          } else {
            return <PaymentCard key={record.id} id={record.id} card={{ brand: record.card_type, last4: record.last_4 }}/>
          }
        }
      },
      {
        title: 'Transfer Date',
        dataIndex: 'inserted_at',
        render: data => moment.utc(data).local().format('lll'),
        align: 'left',
      },
    ]

    const { loading, error, dcPurchases } = this.props.data

    if (loading) return null;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <Card
        title="Payment History"
        bodyStyle={{ padding: 0, paddingTop: 1, overflowX: 'scroll' }}
      >
        <Table
          columns={columns}
          dataSource={dcPurchases.entries}
          rowKey={record => record.id}
          pagination={false}
          style={{ minWidth: 800 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0}}>
          <Pagination
            current={dcPurchases.pageNumber}
            pageSize={dcPurchases.pageSize}
            total={dcPurchases.totalEntries}
            onChange={page => this.handleChangePage(page)}
            style={{marginBottom: 20}}
          />
        </div>
      </Card>
    )
  }
}

export default DataCreditPurchasesTable
