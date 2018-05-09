import React, { Component } from 'react';

//MUI
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import AddIcon from 'material-ui-icons/Add';
import ClearIcon from 'material-ui-icons/Clear';
import Button from 'material-ui/Button';

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
    const newHeadersArray = this.state.headers.slice(0, index).concat(updatedEntry, this.state.headers.slice(index + 1))

    this.setState({ headers: newHeadersArray }, this.validateInput)
  }

  validateInput() {
    const { method, endpoint, headers } = this.state
    if (method.length > 0 && endpoint.length > 0) {
      // check header validation, if pass
      this.props.onValidInput({
        method,
        endpoint,
        headers
      })
    }
  }

  render() {
    return(
      <Card style={{marginTop: 24}}>
        <CardContent>
          <Typography variant="headline">
            Step 2
          </Typography>

          <Typography component="p" style={{marginTop: 12, fontWeight: '500'}}>
            Enter your HTTP Connection Details
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
        </CardContent>
      </Card>
    );
  }
}

export default HTTPForm;
