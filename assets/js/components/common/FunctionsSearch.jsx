import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import { SEARCH_FUNCTIONS } from '../../graphql/search';
import { Typography, Button, Select } from 'antd';
const { Option } = Select;
const { Text } = Typography;
import debounce from 'lodash/debounce';
import find from 'lodash/find';
import UserCan from '../common/UserCan';

const queryOptions = {
  options: props => ({
    variables: {
      query: ""
    }
  })
}

@graphql(SEARCH_FUNCTIONS, queryOptions)
class FunctionsSearch extends Component {
  state = {
    searchFunctions: [],
    selectedFunction: undefined,
  }

  runSearch = (value) => {
    const { loading, fetchMore } = this.props.data

    this.setState({ selectedFunction: value}, () => {
      if (!loading) {
        fetchMore({
          variables: { query: value },
          updateQuery: (prev, { fetchMoreResult }) => {
            const { searchFunctions } = fetchMoreResult;

            const functions = [];
            searchFunctions.forEach(f => {
              const result = find(this.props.allFunctions, { id: f.id });
              if (result) functions.push(result);
            })

            this.setState({ searchFunctions: functions });
          }
        })
      }
    })
  }

  handleSelect = value => {
    this.setState({ selectedFunction: value }, () => {
      this.props.handleFunctionSelection(value);
    });
  }

  render() {
    const { searchFunctions, selectedFunction } = this.state;
    const debouncedSearch = debounce(this.runSearch, 300);

    return (
      <div style={{ paddingRight: 17, borderRight: '1px solid #D9D9D9', marginRight: 30 }}>
        <Text style={{marginBottom: 6, display:'block'}}>Select a Function</Text>
        <Select
          showSearch
          placeholder="Select a function..."
          onSearch={text => debouncedSearch(text)}
          onSelect={this.handleSelect}
          style={{ width: 300, marginBottom: 10 }}
          showArrow={false}
          filterOption={false}
          defaultActiveFirstOption={false}
          notFoundContent={null}
          autoClearSearchValue
          value={selectedFunction}
        >
          {searchFunctions.map(f => (
            <Option value={f.id} key={f.id}>
              <Text>{f.name}</Text>
            </Option>
          ))}
        </Select>
      </div>
    )
  }
}

export default FunctionsSearch;
