import React, { Component } from 'react';

//MUI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

//icons
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';

class HTTPForm extends Component {
  constructor(props) {
    super(props);

    this.handleInputUpdate = this.handleInputUpdate.bind(this)
    this.handleHttpHeaderUpdate = this.handleHttpHeaderUpdate.bind(this)
    this.addHeaderRow = this.addHeaderRow.bind(this)
    this.removeHeaderRow = this.removeHeaderRow.bind(this)
    this.validateInput = this.validateInput.bind(this)
    this.state = {
      method: "post",
      endpoint: "",
      headers: [
        { header: "", value: "" },
        { header: "", value: "" }
      ]
    }
  }

  addHeaderRow() {
    const newHeadersArray = [...this.state.headers, { header: "", value: "" }]
    this.setState({ headers: newHeadersArray })
  }

  removeHeaderRow(index) {
    const newHeadersArray = this.state.headers.slice(0, index).concat(this.state.headers.slice(index + 1))
    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value}, this.validateInput)
  }

  handleHttpHeaderUpdate(e) {
    let index, input
    [index, input] = e.target.name.split('-')

    const updatedEntry = Object.assign({}, this.state.headers[index], { [input]: e.target.value })
    const newHeadersArray = this.state.headers
    newHeadersArray[index] = updatedEntry

    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  validateInput() {
    const { method, endpoint, headers } = this.state
    if (method.length > 0 && endpoint.length > 0) {
      const parsedHeaders = headers.reduce((a, h) => {
        if (h.header !== "" && h.value !== "") a[h.header] = h.value
        return a
      }, {})

      this.props.onValidInput({
        method,
        endpoint,
        headers: parsedHeaders,
      })
    }
  }

  render() {
    const { type } = this.props

    return(
      <div>
        <Typography variant="headline">
          {type === "update" ? "Update Channel" : "Step 2"}
        </Typography>

        <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
          {type === "update" ? "Update your HTTP Connection Details" : "Enter your HTTP Connection Details"}
        </Typography>

        <div style={{width: '50%'}}>
          <Select
            value={this.state.method}
            onChange={this.handleInputUpdate}
            inputProps={{
              name: 'method',
              id: 'httpMethod',
            }}
            style={{width: 100}}
          >
            <MenuItem value="post">POST</MenuItem>
            <MenuItem value="get">GET</MenuItem>
            <MenuItem value="put">PUT</MenuItem>
            <MenuItem value="patch">PATCH</MenuItem>
          </Select>

          <TextField
            type="text"
            label="Endpoint"
            name="endpoint"
            value={this.state.endpoint}
            onChange={this.handleInputUpdate}
            style={{width: "calc(100% - 112px)", marginLeft: 12}}
          />
        </div>

        {
          this.state.headers.map((obj, i) => (
            <div key={i} style={{width: '50%'}}>
              <TextField
                type="text"
                label="HTTP Header"
                name={`${i}-header`}
                value={obj.header}
                onChange={this.handleHttpHeaderUpdate}
              />

              <TextField
                type="text"
                label="Value"
                name={`${i}-value`}
                value={obj.value}
                onChange={this.handleHttpHeaderUpdate}
                style={{marginLeft: 12}}
              />

              {
                (i > 1) &&
                  <Button variant="fab" mini onClick={() => this.removeHeaderRow(i)} style={{backgroundColor: 'white', boxShadow: 'none'}}>
                    <ClearIcon />
                  </Button>
              }
            </div>
          ))
        }

        <Button variant="fab" mini onClick={this.addHeaderRow} style={{marginTop: 12}}>
          <AddIcon />
        </Button>
      </div>
    );
  }
}

export default HTTPForm;
