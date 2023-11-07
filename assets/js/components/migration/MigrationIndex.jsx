import React, { Component } from "react";
import { DesktopDisplay } from "../mobile/MediaQuery";
import DashboardLayout from "../common/DashboardLayout";
import MigrationSelectLabel from "./MigrationSelectLabel";

class MigrationIndex extends Component {
  state = {
      showStep: 1,
      apiKey: "",
      tenantId: "",
      application: "",
      label: ""
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
                handleUpdate={this.handleUpdate}
                handleSelect={this.handleSelect}
                updateShowStep={this.updateShowStep}
              />
          )}
        </DashboardLayout>
      </DesktopDisplay>
    )
  }
}

export default MigrationIndex
