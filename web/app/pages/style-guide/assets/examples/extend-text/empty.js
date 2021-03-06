import React from 'react';
import ExtendText from '../../../../../../../src/components/extend-text';

class ExtendTextEmptyExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      options: [],
      value: null
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(newValue) {
    this.setState({
      value: newValue
    });
  }

  render() {
    return (
      <ExtendText
        options={this.state.options}
        value={this.state.value}
        onChange={this.onChange}
        allowCreate
      />
    );
  }
}

ExtendTextEmptyExample.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ExtendTextEmptyExample;
