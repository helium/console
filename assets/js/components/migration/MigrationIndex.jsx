import React, { Component } from "react";
import { getApplications } from '../../actions/migration'
import { DesktopDisplay } from "../mobile/MediaQuery";
import DashboardLayout from "../common/DashboardLayout";
import MigrationSelectLabel from "./MigrationSelectLabel";
import MigrationDeviceTable from "./MigrationDeviceTable";

class MigrationIndex extends Component {
  state = {
      showStep: 1,
      apiKey: "",
      tenantId: "",
      application: "",
      label: "",
      allLabels: [],
      allApplications: []
  }

  updateShowStep = (step) => {
    this.setState({ showStep: step })
  }

  handleUpdate = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSelect = (key, value) => {
    this.setState({
      [key]: value
    })
  }

  fetchApplications = (apiKey, tenantId) => {
    this.setState({ allLabels: [], allApplications: [] })
    getApplications(apiKey, tenantId)
    .then(data => {
      this.setState({ allLabels: data.labels, allApplications: data.applications })
    })
    .catch(err => {})
  }

  render() {
    return (
      <DesktopDisplay>
        <DashboardLayout title="Console Migration Tool" {...this.props}>
          {this.state.showStep == 1 && (
              <MigrationSelectLabel
                apiKey={this.state.apiKey}
                tenantId={this.state.tenantId}
                application={this.state.application}
                label={this.state.label}
                allLabels={this.state.allLabels}
                allApplications={this.state.allApplications}
                handleUpdate={this.handleUpdate}
                handleSelect={this.handleSelect}
                updateShowStep={this.updateShowStep}
                fetchApplications={this.fetchApplications}
              />
          )}
          {this.state.showStep == 2 && (
              <MigrationDeviceTable
                updateShowStep={this.updateShowStep}
                label={this.state.label}
                apiKey={this.state.apiKey}
                tenantId={this.state.tenantId}
                applicationId={this.state.application}
              />
          )}
        </DashboardLayout>
      </DesktopDisplay>
    )
  }
}

export default MigrationIndex
