import React, { Component } from 'react'
import withGql from '../../graphql/withGql'
import { connect } from 'react-redux'
import moment from 'moment'
import numeral from 'numeral'
import PaymentCard from './PaymentCard'
import { minWidth } from '../../util/constants'
import { PAGINATED_DC_PURCHASES } from '../../graphql/dcPurchases'
import { Card, Typography, Table, Pagination } from 'antd';
import CaretLeftOutlined from '@ant-design/icons/CaretLeftOutlined';
import CaretRightOutlined from '@ant-design/icons/CaretRightOutlined';
import { SkeletonLayout } from '../common/SkeletonLayout';
const { Text } = Typography

const styles = {
  greenIcon: {
    fontSize: 12,
    color: '#2BE5A2',
    marginRight: 5
  },
  redIcon: {
    fontSize: 12,
    color: '#FF7875',
    marginRight: 5
  }
}

class DataCreditPurchasesTable extends Component {
  state = {
    page: 1,
    pageSize: 10,
  }

  componentDidMount() {
    const { socket, currentOrganizationId } = this.props

    this.channel = socket.channel("graphql:dc_purchases_table", {})
    this.channel.join()
    this.channel.on(`graphql:dc_purchases_table:${currentOrganizationId}:update_dc_table`, (message) => {
      this.refetchPaginatedEntries(this.state.page, this.state.pageSize)
    })
  }

  componentWillUnmount() {
    this.channel.leave()
  }

  handleChangePage = (page) => {
    this.setState({ page })

    const { pageSize } = this.state
    this.refetchPaginatedEntries(page, pageSize)
  }

  refetchPaginatedEntries = (page, pageSize) => {
    const { refetch } = this.props.dcPurchasesQuery
    refetch({ page, pageSize })
  }

  render() {
    const columns = [
      {
        title: 'Data Credits',
        dataIndex: 'dc_purchased',
        render:  (data, record) => {
          if (record.card_type == "transfer" && record.to_organization){
            return "-" + numeral(data).format('0,0')
          } else {
            return "+" + numeral(data).format('0,0')
          }
        }
      },
      {
        title: 'From/To',
        dataIndex: 'payment_id',
        render:  (data, record) => {
          if (record.card_type == "transfer" && record.from_organization){
            return <Text><CaretLeftOutlined style={styles.greenIcon} />{record.from_organization}</Text>
          } else if (record.card_type == "transfer" && record.to_organization){
            return <Text><CaretRightOutlined style={styles.redIcon} />{record.to_organization}</Text>
          } else if (record.card_type == "burn") {
            return <Text><CaretLeftOutlined style={styles.greenIcon} />{data}</Text>
          } else {
            return <Text><CaretLeftOutlined style={styles.greenIcon} />Helium, Inc</Text>
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
            return "Blockchain"
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

    const { loading, error, dcPurchases } = this.props.dcPurchasesQuery
    const title = "Payment History";

    if (loading) return <SkeletonLayout />;
    if (error) return (
      <Text>Data failed to load, please reload the page and try again</Text>
    )

    return (
      <Card
        title={title}
        bodyStyle={{ padding: 0, paddingTop: 1 }}
      >
        <div className="no-scroll-bar" style={{ overflowX: 'scroll' }}>
          <Table
            columns={columns}
            dataSource={dcPurchases.entries}
            rowKey={record => record.id}
            pagination={false}
            style={{ minWidth, overflowX: 'scroll' }}
            className="no-scroll-bar"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 0, minWidth }}>
            <Pagination
              current={dcPurchases.pageNumber}
              pageSize={dcPurchases.pageSize}
              total={dcPurchases.totalEntries}
              onChange={page => this.handleChangePage(page)}
              style={{marginBottom: 20}}
              showSizeChanger={false}
            />
          </div>
        </div>
      </Card>
    )
  }
}

function mapStateToProps(state, ownProps) {
  return {
    socket: state.apollo.socket,
    currentOrganizationId: state.organization.currentOrganizationId,
  }
}

export default connect(mapStateToProps, null)(
  withGql(DataCreditPurchasesTable, PAGINATED_DC_PURCHASES, props => ({ fetchPolicy: 'cache-first', variables: { page: 1, pageSize: 10 }, name: 'dcPurchasesQuery' }))
)
