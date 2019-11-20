import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import UserCan from '../common/UserCan'
import PaginatedTable from '../common/PaginatedTable'
import { PAGINATED_CHANNELS, CHANNEL_SUBSCRIPTION } from '../../graphql/channels'
import BlankSlate from '../common/BlankSlate'

// redux
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteChannel, updateChannel } from '../../actions/channel'

// MUI
import Button from '@material-ui/core/Button';

@connect(null, mapDispatchToProps)
class ChannelsTable extends Component {

  render() {
    const { deleteChannel, updateChannel } = this.props

    const columns = [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: props => <Link to={`/channels/${props.row.id}`}>{props.value}</Link>
      },
      {
        Header: 'Type',
        accessor: 'type_name'
      },
      {
        Header: '',
        numeric: true,
        Cell: props => <span>
          {
            !props.row.default && <UserCan action="update" itemType="channel" item={props.row}>
              <Button
                color="primary"
                onClick={() => {
                  console.log("ACTION_SET_DEFAULT_CHANNEL", props.row.id)
                  updateChannel(props.row.id, { default: true })
                }}
                size="small"
              >
                Set Default
              </Button>
            </UserCan>
          }
          <UserCan action="delete" itemType="channel" item={props.row}>
            <Button
              color="secondary"
              onClick={() => {
                console.log("ACTION_DELETE_CHANNEL", props.row.id)
                deleteChannel(props.row.id)
              }}
              size="small"
            >
              Delete
            </Button>
          </UserCan>
        </span>
      },
    ]

    return (
      <PaginatedTable
        columns={columns}
        query={PAGINATED_CHANNELS}
        subscription={CHANNEL_SUBSCRIPTION}
        EmptyComponent={ props => <BlankSlate title="No channels" subheading="" /> }
        variables={{pageSize: 5}}
      />
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ deleteChannel, updateChannel }, dispatch);
}

export default ChannelsTable
