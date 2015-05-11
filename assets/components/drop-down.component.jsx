var React = require('react/addons');
var singlePanelMixin = require('../mixins/single-panel.mixin');
var domUtilities = require('dom-utilities');

var dropDown = {};

dropDown.displayName = 'dropDown';

dropDown.mixins = [
  React.addons.PureRenderMixin,
  singlePanelMixin
];

dropDown.propTypes = {
  className: React.PropTypes.string,
  handle: React.PropTypes.node.isRequired,
  content: React.PropTypes.node.isRequired,
  align: React.PropTypes.oneOf(['left', 'right']),
};

dropDown.getDefaultProps = function dropDownGetDefaultProps() {
  return {
    className: null,
    handle: null,
    content: null,
    align: 'left'
  };
};

dropDown.getInitialState = function dropDownGetInitialState() {
  return {
    isActive: false
  };
};

dropDown.componentDidMount = function() {
  var handleHeight = Math.ceil(domUtilities.getDimensions(this.refs.handle.getDOMNode()).height);
  var handleWidth = Math.ceil(domUtilities.getDimensions(this.refs.handle.getDOMNode()).width);
  var contentWidth = Math.ceil(domUtilities.getDimensions(this.refs.content.getDOMNode()).width);
  this.refs.content.getDOMNode().style.minWidth = contentWidth + 'px';
  this.refs.content.getDOMNode().style.top = handleHeight + 10 + 'px';

  //NOTE: 26 is based off the css for the triangle
  this.refs.content.getDOMNode().style[this.props.align] = (handleWidth / 2) - 26 + 'px';
};

dropDown.getCssClasses = function dropDownGetCssClasses() {
  var cssClasses = ['drop-down'];

  if (this.props.className) {
    cssClasses = cssClasses.concat(this.props.className.split(' '));
  }

  if (this.state.isActive === true) {
    cssClasses.push('is-active');
  }

  return cssClasses;
};

dropDown.singlePanelClose = function dropDownSinglePanelClose() {
  this.setState({
    isActive: false
  });
};

dropDown.onClickHandle = function dropDownOnClickHandle() {
  this.dontCloseOnClick = true;
  this.setState({
    isActive: !this.state.isActive
  });
};

dropDown.onClickContent = function dropDownOnClickContent() {
  this.dontCloseOnClick = true;
};

dropDown.render = function dropDownRender() {
  return (
    <span className={this.getCssClasses().join(' ')}>
      <span
        ref="handle"
        className="drop-down__handle"
        onClick={this.onClickHandle}
      >
        {this.props.handle}
      </span>
      <div
        ref="content"
        className="drop-down__content"
        onClick={this.onClickContent}
      >
        <div className={'drop-down__triangle m-' + this.props.align}></div>
        <div className={'drop-down__triangle-inner m-' + this.props.align}></div>
        {this.props.content}
      </div>
    </span>
  );
};

module.exports = React.createClass(dropDown);