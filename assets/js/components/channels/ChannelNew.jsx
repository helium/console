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
import AdafruitForm from './forms/AdafruitForm.jsx';
import UbidotsForm from './forms/UbidotsForm.jsx'
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
import { IntegrationTypeTileSimple } from './IntegrationTypeTileSimple';
import DecoderForm from './DecoderForm';
import { NEW_CHANNEL_TYPES, PREMADE_CHANNEL_TYPES } from '../../util/integrationInfo';
const { Text } = Typography
const { Option } = Select
import _JSXStyle from "styled-jsx/style"

const queryOptions = {
  options: props => ({
    fetchPolicy: 'cache-and-network',
  })
}

const adafruitBody = `{
  "feeds": {
    {{#decoded}}{{#payload}}
        {{^value.altitude}}
            {{#value.x}}
                "{{name}}_x": "{{value.x}}",
                "{{name}}_y": "{{value.y}}",
                "{{name}}_z": "{{value.z}}"{{^last}},{{/last}}
            {{/value.x}}
            {{^value.x}}
                "{{name}}":"{{value}}"{{^last}},{{/last}}
            {{/value.x}}
        {{/value.altitude}}
    {{/payload}}{{/decoded}}
  },
  "location": {
    {{#decoded}}{{#payload}}
        {{^value.x}}
            {{#value.altitude}}
                "ele": "{{value.altitude}}",
                "lat": "{{value.latitude}}",
                "lon": "{{value.longitude}}"
            {{/value.altitude}}
        {{/value.x}}
    {{/payload}}{{/decoded}}
  }
}`;

@connect(null, mapDispatchToProps)
@graphql(ALL_LABELS, queryOptions)
class ChannelNew extends Component {
  state = {
    type: this.props.match.params.id,
    showNextSteps: false,
    credentials: {},
    channelName: "",
    labels: {},
    templateBody: this.props.match.params.id === 'adafruit' ? adafruitBody : "",
    func: {
      format: 'cayenne'
    }
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
        templateBody: "",
        validInput: true
      })
  }

  handleStep2Input = (credentials, validInput = true) => {
    this.setState({ credentials, showNextSteps: true, validInput })
  }

  handleStep3Input = (e) => {
    this.setState({ channelName: e.target.value})
  }

  handleDecoderSelection = payload => {
    let func;
    if (payload.format === 'custom') {
      func = {
        format: 'custom',
        id: payload.func ? payload.func.id : null
      };
    } else {
      func = {
        name: this.state.channelName,
        format: 'cayenne'
      }
    }
    this.setState({ func, templateBody: payload.format === 'cayenne' ? adafruitBody : "" });
  }

  getRootType = (type) => {
    switch(type) {
      case 'cargo':
      case 'mydevices':
      case 'ubidots':
        return 'http';
      case 'adafruit':
        return 'mqtt';
      default:
        return type;
    }
  }

  handleStep3Submit = (e) => {
    e.preventDefault()
    const { channelName, type, credentials, labels, templateBody, func } = this.state
    analyticsLogger.logEvent("ACTION_CREATE_CHANNEL", { "name": channelName, "type": type })
    let payload = {
      channel: {
        name: channelName,
        type: this.getRootType(type),
        credentials,
        payload_template: type === "http" || type === "mqtt" || type === "adafruit" ? templateBody : undefined,
      }
    };
    if (type === 'adafruit') {
      payload.func = func;
    } else {
      payload.labels = labels;
    }
    this.props.createChannel(payload);
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
      case "adafruit":
        return <AdafruitForm onValidInput={this.handleStep2Input} />
      case "ubidots":
        return <UbidotsForm onValidInput={this.handleStep2Input}/>
      default:
        return <CargoForm onValidInput={this.handleStep2Input}/>
    }
  }

  getIntegrationType = () => {
    return [...PREMADE_CHANNEL_TYPES, ...NEW_CHANNEL_TYPES].filter(t => (
      t.link.split("new/")[1] === this.state.type)
    );
  }

  render() {
    const { showNextSteps, type, labels } = this.state
    const { allLabels } = this.props.data

    return(
      <DashboardLayout
        title="Add Integration"
        user={this.props.user}
        breadCrumbs={
          <div style={{ marginLeft: 4, paddingBottom: 0 }}>
            <Link to="/integrations"><Text style={{ color: "#8C8C8C" }}>Integrations&nbsp;&nbsp;/</Text></Link>
            {type ?
              (<Link to="/integrations/new"><Text style={{ color: `${type ? "#8C8C8C" : ""}` }}>&nbsp;&nbsp;Add Integration&nbsp;&nbsp;/</Text></Link>) :
              (<Text>&nbsp;&nbsp;Add Integration</Text>)
            }
            <Text>&nbsp;&nbsp;{type ? this.getIntegrationType()[0].name : null}</Text>
          </div>
        }
      >

      <Card title="Step 1 – Choose an Integration Type">
        {type && (
          <div className="flexwrapper" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <IntegrationTypeTileSimple type={type} />
            <Link to="/integrations/new"><Button size="small">Change</Button></Link>
          </div>
        )}
        {!type && (
          <div className="flexwrapper">
            <Card size="small" title="Add a Prebuilt Integration" className="integrationcard">
              <ChannelPremadeRow />
            </Card>
            <Card size="small" title="Add a Custom Integration" className="integrationcard">
              <ChannelCreateRow />
            </Card>
          </div>
        )}
        </Card>
        { type && (
          <Card title="Step 2 - Endpoint Details">
            {this.renderForm()}
          </Card>
        )}
        { showNextSteps && (
            <ChannelNameForm
              channelName={this.state.channelName}
              onInputUpdate={this.handleStep3Input}
            />
        )}
        { showNextSteps && type === 'adafruit' && (
          <DecoderForm onChange={this.handleDecoderSelection}>
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleStep3Submit}
                disabled={!this.state.validInput}
              >
                Add Integration
              </Button>
            </div>
          </DecoderForm>
        )}
        { showNextSteps && type !== 'adafruit' && (
          <Card title={"Step 4 - Apply Integration to Label (Can be added later)"}>
            <Text style={{display:'block', marginBottom: 30}}>Labels are necessary to connect devices to integrations</Text>
            <LabelsAppliedNew handleLabelsUpdate={this.handleLabelsUpdate} />
            <div style={{ marginTop: 20 }}>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleStep3Submit}
                disabled={!this.state.validInput}
              >
                Add Integration
              </Button>
            </div>
          </Card>
        )}
        { showNextSteps && (type === "http" || type === "mqtt") && (
          <ChannelPayloadTemplate
            templateBody={this.state.templateBody}
            handleTemplateUpdate={this.handleTemplateUpdate}
            functions={labels.labelsApplied ? labels.labelsApplied.map(l => l.function) : []}
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
