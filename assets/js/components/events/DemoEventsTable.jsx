import React, { Component } from 'react'
import { formatDatetime } from '../../util/time'
import { DEMO_EVENTS_SUBSCRIPTION, EVENT_FRAGMENT } from '../../graphql/events'
import { withStyles } from '@material-ui/core/styles';

// GraphQL
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

// MUI
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const styles = theme => ({
  newRow: {
    backgroundColor: "#E8E8E8"
  },
});

@withStyles(styles)
class DemoEventsTable extends Component {
  constructor(props) {
    super(props)
    this.state = {
      newRow: false
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.demoEvents && this.props.data.demoEvents.length - 1 === prevProps.data.demoEvents.length) {
      this.setState({ newRow: true })
      setTimeout(() => {
        this.setState({ newRow: false})
      }, 1000)
    }
  }

  render() {
    const { demoEvents } = this.props.data
    const { classes } = this.props
    const { newRow } = this.state
    const columns = [
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Payload',
        accessor: 'payload',
      },
      {
        Header: 'Size',
        accessor: 'payload_size',
      },
      {
        Header: 'RSSI',
        accessor: 'rssi',
      },
      {
        Header: 'Direction',
        accessor: 'direction',
      },
      {
        Header: 'Time',
        accessor: 'reported_at',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
    ]

    if (demoEvents) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, i) =>
                <TableCell
                  key={`header-${i}`}
                >
                  {column.Header}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {demoEvents.map((event, i) =>
              <TableRow key={`row-${i}`} className={(i == 0 && newRow) ? classes.newRow : ""}>
                {columns.map(column =>
                    <TableCell key={`row-${i}-${column.accessor}`}>
                      {
                        (column.Header == "Time") ?
                          formatDatetime(demoEvents[i][column.accessor]) :
                          demoEvents[i][column.accessor]
                      }
                    </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )
    }

    return (
      <p>...Loading</p>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      teamId: props.team_id,
    }
  })
}

const query = gql`
  query DemoEventsQuery ($teamId: String) {
    demoEvents(teamId: $teamId) {
      ...EventFragment
    }
  }
  ${EVENT_FRAGMENT}
`

const TableWithData = graphql(query, queryOptions)(DemoEventsTable)

export default TableWithData
