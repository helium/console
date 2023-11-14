import React, { Component } from "react";
import { getApplications } from '../../actions/migration'
import { displayError } from '../../util/messages'
import { DesktopDisplay } from "../mobile/MediaQuery";
import DashboardLayout from "../common/DashboardLayout";
import MigrationSelectLabel from "./MigrationSelectLabel";
import MigrationDeviceTable from "./MigrationDeviceTable";

class MigrationIndex extends Component {
  state = {
      showStep: 1,
      apiKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjaGlycHN0YWNrIiwiaXNzIjoiY2hpcnBzdGFjayIsInN1YiI6Ijc1MjM3ZjNkLTg2MGItNGEwOS1iN2ExLWVlYTQwMWIzMmQ3MSIsInR5cCI6ImtleSJ9.NkuVuqBwiirsnOMCl0M_wSMX0GLA86HS5pOV2GWJxUA",
      tenantId: "52f14cd4-c6f1-4fbd-8f87-4025e1d49242",
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
              />
          )}
        </DashboardLayout>
      </DesktopDisplay>
    )
  }
}

export default MigrationIndex
