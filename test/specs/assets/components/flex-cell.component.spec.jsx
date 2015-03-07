var React = require('react/addons');
var reactTestUtils = React.addons.TestUtils;
var FlexCell = require('../../../../assets/components/flex-cell.component.jsx');
var testHelper = require('../../../test-helper');

describe.only('flex cell component', function() {
  var div;

  beforeEach(function() {
    div = document.createElement('div');
  });

  it('should render', function() {
    this.component = React.render(<FlexCell>1</FlexCell>, div);
    var dataCell = reactTestUtils.findRenderedDOMComponentWithClass(this.component, 'flex-row__cell-data');

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell');
    expect(dataCell.props.children).to.equal('1');
  });

  it('should be able to set small columns', function() {
    this.component = React.render(<FlexCell smallColumns={4}>1</FlexCell>, div);

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell m-small-columns4');
  });

  it('should be able to set medium columns', function() {
    this.component = React.render(<FlexCell mediumColumns={4}>1</FlexCell>, div);

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell m-medium-columns4');
  });

  it('should be set columns', function() {
    this.component = React.render(<FlexCell columns={4}>1</FlexCell>, div);

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell m-columns4');
  });

  it('should be able to set large columns', function() {
    this.component = React.render(<FlexCell largeColumns={4}>1</FlexCell>, div);

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell m-large-columns4');
  });

  it('should be set alignment', function() {
    this.component = React.render(<FlexCell align="center">1</FlexCell>, div);

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell m-align-center');
  });

  it('should be set flex', function() {
    this.component = React.render(<FlexCell flex={true}>1</FlexCell>, div);

    expect(this.component.getDOMNode().className).to.equal('flex-row__cell m-flex');
  });
});
