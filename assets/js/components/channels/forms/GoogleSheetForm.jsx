import React, { Component } from 'react';
import { Typography, Input, Button, Select } from 'antd';
import cheerio from "cheerio";
import { post } from '../../../util/rest'
const { Text } = Typography
const { Option } = Select

class GoogleSheetForm extends Component {
  state = {
    loading: false,
    formId: "",
    failedToLoadFormData: false,
    fieldsMapping: ""
  }

  handleFormIdUpdate = e => {
    this.setState({ formId: e.target.value })
  }

  getFormData = async () => {
    this.setState({ loading: true, failedToLoadFormData: false })

    post('/api/channels/google_sheets', {
      "formId": this.state.formId
    })
    .then(({ data }) => {
      // from https://restful-google-form.vercel.app/ source code
      const $ = cheerio.load(data);
      const script = $("script:not([src])")
        .toArray()
        .map((s) => $(s)[0].children[0].data)
        .filter((text) => (text ? text.includes("FB_PUBLIC_LOAD_DATA_") : ""))[0];

      if (!script) {
        this.setState({ loading: false, failedToLoadFormData: true })
      } else {
        const _arr = script
          .replace("var FB_PUBLIC_LOAD_DATA_ = ", "")
          .replace(/\,(?!\s*?[\{\[\"\'\w])/g, "") // Remove trailing comma
          .replace(";", "");
        const arr = JSON.parse(_arr);
        const rawQuestions = arr[1][1];
        if (!Array.isArray(rawQuestions)) {
          this.setState({ loading: false, failedToLoadFormData: true })
        } else {
          const loadData = rawQuestions.filter((q) => q);
          const questions = loadData.map(d => {
            return {
              "key": "entry." + d[4][0][0],
              "name": d[1]
            }
          })
          const fieldsMapping = questions.reduce((acc, curr) => {
            return Object.assign({}, acc, { [curr["name"]]: curr["key"] })
          }, {})

          this.setState({ loading: false, fieldsMapping: JSON.stringify(fieldsMapping, null, 2) })
        }
      }
    })
    .catch(() => {
      this.setState({ loading: false, failedToLoadFormData: true })
    })
  }

  validateInput = () => {
    const { formId, fieldsMapping } = this.state
    if (fieldsMapping.length > 0) {
      this.props.onValidInput({
        method: "post",
        endpoint: `https://docs.google.com/forms/d/e/${formId}/formResponse`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })

      this.props.updateGoogleFieldsMapping(fieldsMapping)
    }
  }

  render() {
    return(
      <div>
        <div>
          <Text style={{ display: 'block' }}>Enter Google Form ID:</Text>
        </div>
        <div>
          <Input
            value={this.state.formId}
            onChange={this.handleFormIdUpdate}
            style={{ width: '50%'}}
          />
          <Button
            disabled={this.state.formId.length < 1}
            onClick={this.getFormData}
            style={{ marginLeft: 8 }}
          >
            Get Google Form Fields
          </Button>
        </div>

        {this.state.loading && <div style={{ marginTop: 12 }}><Text>Loading from Google...</Text></div>}
        {this.state.failedToLoadFormData && <div style={{ marginTop: 12 }}><Text>Failed to load data from Google Form, please try again.</Text></div>}
        {this.state.fieldsMapping && (
          <div style={{ marginTop: 12 }}>
            <Text style={{ display: 'block' }}>Obtained Google Form fields</Text>
            <pre style={{ fontSize: 10, marginTop: 10 }}>
              {this.state.fieldsMapping}
            </pre>
            {this.props.from === "ChannelNew" && (
              <Button
                type="primary"
                onClick={this.validateInput}
                style={{ marginTop: 20 }}
              >
                Generate Function Body with Fields Above
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default GoogleSheetForm;
