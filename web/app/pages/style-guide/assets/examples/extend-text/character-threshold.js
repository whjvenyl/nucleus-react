import React from 'react';
import request from 'superagent';
import debounce from 'lodash/debounce';

import ExtendText from '../../../../../../../src/components/extend-text';

let asyncGetData = (input, callback) => {
  request
    .get('/api/tags?delay=1000')
    .end((error, response) => {
      callback({
        options: response.body.tags,
      });
    });
};

let debouncedAsyncGetData = debounce(asyncGetData, 500);

class ExtendTextCharacterThresholdExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: null
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
    this.setState({
      value: newValue
    });
  }

  asyncCallbackFunction(input, callback) {
    debouncedAsyncGetData(input, callback);
  }

  render() {
    return (
      <ExtendText
        asyncOptions={this.asyncCallbackFunction}
        value={this.state.value}
        onChange={this.onChange}
        characterThreshold={3}
      />
    );
  }
}

ExtendTextCharacterThresholdExample.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ExtendTextCharacterThresholdExample;
