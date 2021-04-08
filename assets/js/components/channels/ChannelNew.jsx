import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import DashboardLayout from '../common/DashboardLayout'
import AzureForm from './forms/AzureForm.jsx'
import AWSForm from './forms/AWSForm.jsx'
import GoogleForm from './forms/GoogleForm.jsx'
import MQTTForm from './forms/MQTTForm.jsx'
import HTTPForm from './forms/HTTPForm.jsx'
import CargoForm from './forms/CargoForm.jsx'
import MyDevicesForm from './forms/MyDevicesForm.jsx'
import AdafruitForm from './forms/AdafruitForm.jsx';
import UbidotsForm from './forms/UbidotsForm.jsx'
import DatacakeForm from './forms/DatacakeForm.jsx'
import TagoForm from './forms/TagoForm.jsx'
import ChannelNameForm from './forms/ChannelNameForm.jsx'
import ChannelCreateRow from './ChannelCreateRow'
import ChannelPremadeRow from './ChannelPremadeRow'
import ChannelPayloadTemplate from './ChannelPayloadTemplate'
import { createChannel } from '../../actions/channel'
import analyticsLogger from '../../util/analyticsLogger'
import { Typography, Select, Card, Button } from 'antd';
import { IntegrationTypeTileSimple } from './IntegrationTypeTileSimple';
import { NEW_CHANNEL_TYPES, PREMADE_CHANNEL_TYPES } from '../../util/integrationInfo';
const { Text } = Typography
const { Option } = Select
import _JSXStyle from "styled-jsx/style"
import { adafruitTemplate } from '../../util/integrationTemplates'

@connect(null, mapDispatchToProps)
class ChannelNew extends Component {
  state = {
    type: null,
    showNextSteps: false,
    credentials: {},
    channelName: "",
    templateBody: "",
  }

  componentDidMount() {
    analyticsLogger.logEvent("ACTION_NAV_CHANNELS_NEW")
  }

  handleStep2Input = (credentials, validInput = true) => {
    this.setState({ credentials, showNextSteps: true, validInput })
  }

  handleStep3Input = (e) => {
    this.setState({ channelName: e.target.value})
  }

  getRootType = (type) => {
    switch(type) {
      case 'cargo':
      case 'mydevices':
      case 'ubidots':
        return 'http';
      case 'datacake':
        return 'http';
      case 'tago':
        return 'http';
      case 'adafruit':
        return 'mqtt';
      default:
        return type;
    }
  }

  handleStep3Submit = (e) => {
    e.preventDefault()
    const { channelName, type, credentials, templateBody } = this.state
    analyticsLogger.logEvent("ACTION_CREATE_CHANNEL", { "name": channelName, "type": type })
    let payload = {
      channel: {
        name: channelName,
        type: this.getRootType(type),
        credentials,
        payload_template: type === "http" || type === "mqtt" || type === "adafruit" ? templateBody : undefined,
      }
    };
    this.props.createChannel(payload);
  }

  handleTemplateUpdate = (templateBody) => {
    this.setState({ templateBody });
  }

  handleSelectType = type => {
    this.setState({
      type,
      showNextSteps: false,
      templateBody: type === 'adafruit' ? adafruitTemplate : ""
    })
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
      case "adafruit":
        return <AdafruitForm onValidInput={this.handleStep2Input} />
      case "ubidots":
        return <UbidotsForm onValidInput={this.handleStep2Input}/>
      case "datacake":
        return <DatacakeForm onValidInput={this.handleStep2Input}/>
      case "tago":
        return <TagoForm onValidInput={this.handleStep2Input}/>
      default:
        return <CargoForm onValidInput={this.handleStep2Input}/>
    }
  }

  render() {
    const { showNextSteps, type } = this.state

    return(
      <div style={{ padding: '30px 30px 20px 30px' }}>
        {!type && (
          <div style={{ display: 'block' }}>
            <Card size="small" title="Add a Prebuilt Integration" className="integrationcard">
              <ChannelPremadeRow selectType={this.handleSelectType} />
            </Card>
            <Card size="small" title="Add a Custom Integration" className="integrationcard">
              <ChannelCreateRow selectType={this.handleSelectType} />
            </Card>
          </div>
        )}

        {type && (
          <Card title="Step 1 – Choose an Integration Type">
            <div className="flexwrapper" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <IntegrationTypeTileSimple type={type} />
              <Link to="#" onClick={() => this.setState({type: null})}><Button size="small">Change</Button></Link>
            </div>
          </Card>
        )}

        {type && (
          <Card title="Step 2 - Endpoint Details">
            {this.renderForm()}
          </Card>
        )}
        { showNextSteps && (
          <ChannelNameForm
            channelName={this.state.channelName}
            onInputUpdate={this.handleStep3Input}
            validInput={this.state.validInput}
            handleStep3Submit={this.handleStep3Submit}
          />
        )}
        { showNextSteps && (type === "http" || type === "mqtt") && (
          <ChannelPayloadTemplate
            templateBody={this.state.templateBody}
            handleTemplateUpdate={this.handleTemplateUpdate}
            functions={[]}
            from="channelNew"
          />
        )}
         <style jsx>{`
          .flexwrapper {
            display: flex;
            flex-wrap: wrap;

          }
          .integrationcard {
            flex-grow: 1;
          }
          `}</style>
      </div>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createChannel }, dispatch);
}

export default ChannelNew
