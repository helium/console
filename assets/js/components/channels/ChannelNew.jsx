import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { graphql } from 'react-apollo';
import DashboardLayout from '../common/DashboardLayout'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import CargoForm from './forms/CargoForm.jsx'
import MyDevicesForm from './forms/MyDevicesForm.jsx'
import ChannelNameForm from './forms/ChannelNameForm.jsx'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelPremadeRow from './ChannelPremadeRow'
import ChannelPayloadTemplate from './ChannelPayloadTemplate'
import LabelTag from '../common/LabelTag'
import LabelsAppliedNew from '../common/LabelsAppliedNew';
import { createChannel } from '../../actions/channel'
import analyticsLogger from '../../util/analyticsLogger'
import { ALL_LABELS } from '../../graphql/labels'
import { Typography, Select, Card, Button } from 'antd';
const { Text } = Typography
const { Option } = Select

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

@connect(null, mapDispatchToProps)
@graphql(ALL_LABELS, queryOptions)
class ChannelNew extends Component {
  state = {
    type: this.props.match.params.id,
    showNextSteps: false,
    credentials: {},
    channelName: "",
    labels: {},
    templateBody: ""
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_NEW")
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id)
      this.setState({
        type: this.props.match.params.id,
        showNextSteps: false,
        credentials: {},
        channelName: "",
        labels: [],
        templateBody: ""
      })
  }

  handleStep2Input = (credentials) => {
    this.setState({ credentials, showNextSteps: true })
  }

  handleStep3Input = (e) => {
    this.setState({ channelName: e.target.value})
  }

  handleStep3Submit = (e) => {
    e.preventDefault()
    const { channelName, type, credentials, labels, templateBody } = this.state
    analyticsLogger.logEvent("ACTION_CREATE_CHANNEL", { "name": channelName, "type": type })
    this.props.createChannel({
      name: channelName,
      type: type == 'cargo' || type == 'mydevices' ? 'http' : type,
      credentials,
      payload_template: type == "http" || type == "mqtt" ? templateBody : undefined,
    }, labels)
  }

  handleLabelsUpdate = (labels) => {
    this.setState({ labels });
  }

  handleTemplateUpdate = (templateBody) => {
    this.setState({ templateBody });
  }

  renderForm = () => {
    switch (this.state.type) {
      case "aws":
        return <AWSForm onValidInput={this.handleStep2Input}/>
      case "google":
        return <GoogleForm onValidInput={this.handleStep2Input}/>
      case "mqtt":
        return <MQTTForm onValidInput={this.handleStep2Input}/>
      case "http":
        return <HTTPForm onValidInput={this.handleStep2Input}/>
      case "azure":
        return <AzureForm onValidInput={this.handleStep2Input}/>
      case "mydevices":
        return <MyDevicesForm onValidInput={this.handleStep2Input}/>
      default:
        return <CargoForm onValidInput={this.handleStep2Input}/>
    }
  }

  render() {
    const { showNextSteps, type } = this.state
    const { allLabels } = this.props.data

    return(
      <DashboardLayout
        title="Create New Integration"
        user={this.props.user}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
            <Link to="/integrations"><Text style={{ color: "#8C8C8C" }}>Channels&nbsp;&nbsp;/</Text></Link>
            <Text>&nbsp;&nbsp;Create New Integration</Text>
          </div>
        }
      >

      <Card title="Step 1 – Choose an Integration Type">
      <div className="flexwrapper">

        <Card size="small" title="Add a Prebuilt Integration" className="integrationcard">
          <ChannelPremadeRow />
        </Card>

        <Card size="small" title="Add a Custom Integration" className="integrationcard">
          <ChannelCreateRow />
        </Card>
        </div>
        </Card>
        <Card title="Step 2 - Verify Details">
          {this.renderForm()}
        </Card>
        { showNextSteps && (
            <ChannelNameForm
              channelName={this.state.channelName}
              onInputUpdate={this.handleStep3Input}
            />
        )}
        { showNextSteps && (
          <Card title="Step 4 - Apply Integration to Label (Can be added later)">
            <Text style={{display:'block', marginBottom: 30}}>Labels are necessary to connect devices to integrations</Text>
            <LabelsAppliedNew handleLabelsUpdate={this.handleLabelsUpdate} />
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleStep3Submit}
              >
                Create Integration
              </Button>
            </div>
          </Card>
        )}
        { showNextSteps && (type == "http" || type == "mqtt") && (
          <ChannelPayloadTemplate templateBody={this.state.templateBody} handleTemplateUpdate={this.handleTemplateUpdate} />
        )}
         <style jsx>{`
          .flexwrapper {
            display: flex;
            flex-wrap: wrap;

          }

          .integrationcard {
            flex-grow: 1;
          }

          .integrationcard:first-of-type {
            margin-right: 20px;
          }


          `}</style>
      </DashboardLayout>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default ChannelNew
