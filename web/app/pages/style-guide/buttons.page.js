import React from 'react';

import CodeExample from '../../react/components/code-example';

import StylesExample from './assets/examples/buttons/styles';
import PillExample from './assets/examples/buttons/pill';
import ThinExample from './assets/examples/buttons/thin';

import { readFileSync } from 'fs';
import { join } from 'path';

const stylesExampleContent = readFileSync(join(__dirname, '/assets/examples/buttons/styles.js'), 'utf8');
const pillExampleContent = readFileSync(join(__dirname, '/assets/examples/buttons/pill.js'), 'utf8');
const thinExampleContent = readFileSync(join(__dirname, '/assets/examples/buttons/thin.js'), 'utf8');

class ButtonsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="p-style-guide-buttons">
        <h1>Buttons</h1>
        <h2>Styles</h2>
        <p>The buttons provide a number of different stylistic options</p>
        <CodeExample
          exampleComponent={StylesExample}
          codeContent={stylesExampleContent}
        />
        <h2>Pills</h2>
        <p>Button can be in the form of a pill</p>
        <CodeExample
          exampleComponent={PillExample}
          codeContent={pillExampleContent}
        />
        <h2>Thin</h2>
        <p>Buttons can be inverted with the thin form</p>
        <CodeExample
          exampleComponent={ThinExample}
          codeContent={thinExampleContent}
        />
      </div>
    );
  }
}

ButtonsPage.displayName = 'ButtonsPage';

ButtonsPage.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default ButtonsPage;