import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import DashboardLayout from '../common/DashboardLayout'
import { updateLabel, deleteLabel } from '../../actions/label'
import { LABEL_SHOW } from '../../graphql/labels'
import analyticsLogger from '../../util/analyticsLogger'
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button } from 'antd';

@connect(null, mapDispatchToProps)
class LabelShow extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const labelId = this.props.match.params.id
    // analyticsLogger.logEvent("ACTION_NAV_LABEL_SHOW", {"id": labelId})
  }

  render() {
    const { deleteLabel, updateLabel } = this.props
    const { loading, label } = this.props.data

    if (loading) return <DashboardLayout />

    return(
      <DashboardLayout title={`${label.name}`}>
        <Button
          size="large"
          icon="setting"
          onClick={() => {}}
        >
          Label Settings
        </Button>
        <Button
          size="large"
          type="danger"
          onClick={() => deleteLabel(label.id)}
          icon="delete"
        />
      </DashboardLayout>
    )
  }
}

const queryOptions = {
  options: props => ({
    variables: {
      id: props.match.params.id
    },
    fetchPolicy: 'cache-and-network',
  })
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateLabel, deleteLabel }, dispatch)
}

const LabelShowWithData = graphql(LABEL_SHOW, queryOptions)(LabelShow)

export default LabelShowWithData
