import React, { Component } from 'react'
import { Query } from 'react-apollo';
import { Link } from 'react-router-dom';
import DashboardLayout from '../common/DashboardLayout'
import CreateLabelModal from '../labels/CreateLabelModal'
import { PAGINATED_LABELS } from '../../graphql/labels'
import analyticsLogger from '../../util/analyticsLogger'
import { Card, Button, Tag } from 'antd';

const defaultVariables = {
  page: 1,
  pageSize: 10
}

class LabelIndex extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showCreateLabelModal: false,
    }
    this.openCreateLabelModal = this.openCreateLabelModal.bind(this)
    this.closeCreateLabelModal = this.closeCreateLabelModal.bind(this)
  }

  componentDidMount() {
    // analyticsLogger.logEvent("ACTION_NAV_LABELS")
  }

  openCreateLabelModal() {
    this.setState({ showCreateLabelModal: true })
  }

  closeCreateLabelModal() {
    this.setState({ showCreateLabelModal: false })
  }

  render() {
    const { showCreateLabelModal } = this.state
    return (
      <DashboardLayout title="Labels">
        <Button
          type="primary"
          size="large"
          icon="tag"
          style={{ marginBottom: 20 }}
          onClick={this.openCreateLabelModal}
        >
          Create New Label
        </Button>

        <Query query={PAGINATED_LABELS} fetchPolicy={'cache-and-network'} variables={defaultVariables}>
          {({ data }) => {
            return (
              <div>
                {data && data.labels.entries.map(l => (
                  <p key={l.id}><Link to={`/labels/${l.id}`}>{l.name}</Link></p>
                ))}
              </div>
            )
          }}
        </Query>

        <CreateLabelModal
          open={showCreateLabelModal}
          onClose={this.closeCreateLabelModal}
        />
      </DashboardLayout>
    )
  }
}

export default LabelIndex
