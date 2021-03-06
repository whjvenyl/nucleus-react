import React from 'react';
import ReactDOM from 'react-dom';
import {
  getPassThroughProperties,
  pureRenderShouldComponentUpdate,
} from '../utilities/component';
import { DomEventManager } from '../utilities/dom';
import cloneDeep from 'lodash/cloneDeep';
import isArray from 'lodash/isArray';

import SvgIcon from './svg-icon';
import FormTextbox from './form-textbox';
import ExtendTextAutoCompleteOption from './extend-text-auto-complete-option';
import Button from './button';
import Badge from './badge';

let loadingSvg;
/*eslint-disable*/
loadingSvg = '<path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946 s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634 c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/> <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0 C22.32,8.481,24.301,9.057,26.013,10.047z"></path>';
/*eslint-enable*/

class ExtendText extends React.Component {
  constructor(props) {
    super(props);

    this.domEventManager = new DomEventManager();

    this.state = {
      isActive: false,
      isLoading: false,
      activeAutoCompleteOptionIndex: null,
      activeAutoCompleteOptions: null,
      lastCheckedInputValue: null,
      inputValue: this.getDisplayValue(props.multiple, props.value)
    };

    this.onFocusInput = this.onFocusInput.bind(this);
    this.onMouseEnterAutoCompleteOption = this.onMouseEnterAutoCompleteOption.bind(this);
    this.asyncOptionsCallback = this.asyncOptionsCallback.bind(this);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onMouseDownAutoCompleteOption = this.onMouseDownAutoCompleteOption.bind(this);
    this.onClickOutside = this.onClickOutside.bind(this);
    this.onClickClearAll = this.onClickClearAll.bind(this);
    this.onClickDeleteTag = this.onClickDeleteTag.bind(this);
    this.onClickDropDownIndicator = this.onClickDropDownIndicator.bind(this);
  }

  componentDidMount() {
    this.domEventManager.add(document, 'mousedown', this.onClickOutside);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return pureRenderShouldComponentUpdate(this.props, nextProps, this.state, nextState);
  }

  //TODO: can I do this in the will receive props so I don't have to do the eslint disable below?
  /*eslint-disable */
  componentDidUpdate(previousProps) {
    //TODO: can I use previous state?
    if (this.state.isActive === true && (this.state.lastCheckedInputValue === null || this.state.lastCheckedInputValue !== this.state.inputValue)) {
      this.updateAutoCompleteOptions();
    }

    //need to make sure to update in the input value when the prop value change to keep everything in sync
    const previousValue = previousProps.value && previousProps.value[0] ? previousProps.value[0].value : null;
    const newValue = this.props.value && this.props.value[0] ? this.props.value[0].value : null;

    if (!this.props.multiple && newValue !== previousValue) {
      this.setState({
        inputValue: this.getDisplayValue(this.props.multiple, this.props.value)
      });
    }
  }
  /*eslint-enable */

  componentWillUnmount() {
    this.domEventManager.clear();
  }

  onClickOutside(event) {
    if (this.state.isActive) {
      let close = true;

      if (
        this.refs.input
        && (
          ReactDOM.findDOMNode(this.refs.input).contains(event.target)
          || ReactDOM.findDOMNode(this.refs.input) === event.target
        )
      ) {
        close = false;
      }

      if (
        close
        && this.refs.dropDownIndicator
        && (
          ReactDOM.findDOMNode(this.refs.dropDownIndicator).contains(event.target)
          || ReactDOM.findDOMNode(this.refs.dropDownIndicator) === event.target
        )
      ) {
        close = false;
      }

      if (
        close
        && this.refs.autoCompleteContainer
        && (
          ReactDOM.findDOMNode(this.refs.autoCompleteContainer).contains(event.target)
          || ReactDOM.findDOMNode(this.refs.autoCompleteContainer) === event.target
        )
      ) {
        close = false;
      }

      if (close) {
        this.closeAutoComplete();
      }
    }
  }

  onFocusInput() {
    this.setState({
      isActive: true,
      activeAutoCompleteOptionIndex: 0
    });
  }

  onKeyDown(event) {
    switch (event.keyCode) {
      case 27: //escape
        event.preventDefault();
        this.closeAutoComplete();
        break;

      case 13: //enter
        event.preventDefault();
        this.selectActiveItem();
        break;

      case 38: //up arrow
        event.preventDefault();
        this.decreaseActiveAutoCompleteOption();
        break;

      case 40: //down arrow
        event.preventDefault();
        this.increaseActiveAutoCompleteOption();
        break;

      case 9: //tab
        this.selectActiveItem();
        break;

      default:
        if (this.props.allowCreate && this.props.multiple && this.props.addTagOnKeyCode === event.keyCode && !event.shiftKey) {
          this.addTagKeyCodeEnter = true;
          event.preventDefault();
          this.selectActiveItem();
        }
        break;
    }
  }

  onMouseEnterAutoCompleteOption(event) {
    this.setState({
      activeAutoCompleteOptionIndex: parseInt(event.target.getAttribute('data-index'), 10)
    });
  }

  onMouseDownAutoCompleteOption() {
    this.selectActiveItem();
  }

  onChangeInput(event) {
    this.setState({
      previousInputValue: this.state.inputValue,
      inputValue: event.target.value
    });
  }

  onClickClearAll() {
    this.setValue([], '');
  }

  onClickDeleteTag(event) {
    const newValue = cloneDeep(this.props.value);
    newValue.splice(parseInt(event.currentTarget.getAttribute('data-key'), 10), 1);

    this.setValue(newValue, '');
  }

  onClickDropDownIndicator() {
    ReactDOM.findDOMNode(this.refs.input).focus();
  }

  getCssClasses() {
    let cssClasses = ['extend-text', `m-${this.props.autoCompletePosition}`];

    if (this.props.className) {
      cssClasses = cssClasses.concat(this.props.className.split(' '));
    }

    if (this.state.isActive) {
      cssClasses.push('is-opened');
    }

    return cssClasses.join(' ');
  }

  asyncOptionsCallback(callbackOptions = {}) {
    if (callbackOptions.options) {
      let exactMatchIndex = this.getExactMatchAutoCompleteOptionIndex(this.state.inputValue, callbackOptions.options);
      let newOptions = this.filterAutoCompleteOptions(callbackOptions.options);

      if (this.props.allowCreate && this.state.inputValue.length > 0) {
        exactMatchIndex = this.getExactMatchAutoCompleteOptionIndex(this.state.inputValue, newOptions);

        if (exactMatchIndex === -1) {
          newOptions = [this.generateObjectValueFromInput()].concat(newOptions);
        }
      }

      this.setState({
        isLoading: false,
        activeAutoCompleteOptions: newOptions,
        activeAutoCompleteOptionIndex: exactMatchIndex !== -1 ? exactMatchIndex : 0
      }, this.repositionAutoCompleteContainerToActiveOption);
    }
  }

  generateObjectValueFromInput() {
    return {
      display: this.props.createTemplate.replace('%%value%%', this.state.inputValue),
      value: this.state.inputValue,
      isNew: true
    };
  }

  selectActiveItem() {
    if (this.state.activeAutoCompleteOptions) {
      this.updateValue(this.state.activeAutoCompleteOptions[this.state.activeAutoCompleteOptionIndex]);
    }
  }

  updateValue(newValue) {
    let realNewValue = newValue;

    if (realNewValue.isNew) {
      realNewValue = {
        display: newValue.value,
        value: newValue.value,
        isNew: true
      };
    }

    if (isArray(this.props.value) && this.props.multiple) {
      realNewValue = this.props.value.concat([realNewValue]);
    } else {
      realNewValue = [realNewValue];
    }

    this.setValue(realNewValue, this.getDisplayValue(this.props.multiple, realNewValue));
  }

  setValue(newValue, newInputValue) {
    if (this.props.onChange) {
      this.props.onChange(newValue);
    }

    const newState = {
      previousInputValue: this.state.inputValue,
      inputValue: newInputValue
    };

    // NOTE: this allow use to update the tags while keeping the auto complete open since the common use case for tagging is adding multiple items
    if (this.addTagKeyCodeEnter || this.props.multiple) {
      this.setState(newState);
      this.addTagKeyCodeEnter = false;
    } else {
      this.closeAutoComplete(newValue, newState);
    }
  }

  updateAutoCompleteOptions() {
    const newState = {
      lastCheckedInputValue: this.state.inputValue,
      activeAutoCompleteOptions: [],
    };

    if (this.props.options.length > 0) {
      newState.activeAutoCompleteOptions = this.filterAutoCompleteOptions(this.props.options);

      const exactMatchIndex = this.getExactMatchAutoCompleteOptionIndex(this.state.inputValue, newState.activeAutoCompleteOptions);
      newState.activeAutoCompleteOptionIndex = exactMatchIndex !== -1 ? exactMatchIndex : 0;
    } else if (
      this.state.isActive
      && this.props.asyncOptions
      && (
        this.state.lastCheckedInputValue !== this.state.inputValue
        || this.state.lastCheckedInputValue === null
      )
      && this.state.inputValue.length >= this.props.characterThreshold
    ) {
      newState.isLoading = true;

      this.props.asyncOptions(this.state.inputValue, this.asyncOptionsCallback);
    }

    if (this.props.allowCreate && newState.activeAutoCompleteOptions && this.state.inputValue.length > 0) {
      const exactMatchIndex = this.getExactMatchAutoCompleteOptionIndex(this.state.inputValue, newState.activeAutoCompleteOptions);

      if (exactMatchIndex === -1) {
        newState.activeAutoCompleteOptions = [this.generateObjectValueFromInput()].concat(newState.activeAutoCompleteOptions);
      }
    }

    this.setState(newState, this.repositionAutoCompleteContainerToActiveOption);
  }

  increaseActiveAutoCompleteOption() {
    if (this.state.activeAutoCompleteOptions && this.state.activeAutoCompleteOptions.length > 0) {
      let newActiveAutoCompleteOptionIndex = this.state.activeAutoCompleteOptionIndex;

      if (newActiveAutoCompleteOptionIndex === null) {
        newActiveAutoCompleteOptionIndex = 0;
      } else {
        newActiveAutoCompleteOptionIndex += 1;
      }

      if (this.state.activeAutoCompleteOptions && newActiveAutoCompleteOptionIndex >= this.state.activeAutoCompleteOptions.length) {
        newActiveAutoCompleteOptionIndex = 0;
      }

      this.setState({
        activeAutoCompleteOptionIndex: newActiveAutoCompleteOptionIndex
      }, this.repositionAutoCompleteContainerToActiveOption);
    }
  }

  decreaseActiveAutoCompleteOption() {
    if (this.state.activeAutoCompleteOptions && this.state.activeAutoCompleteOptions.length > 0) {
      let newActiveAutoCompleteOptionIndex = this.state.activeAutoCompleteOptionIndex;

      if (newActiveAutoCompleteOptionIndex === null) {
        newActiveAutoCompleteOptionIndex = this.state.activeAutoCompleteOptions.length - 1;
      } else {
        newActiveAutoCompleteOptionIndex -= 1;
      }

      if (newActiveAutoCompleteOptionIndex < 0) {
        newActiveAutoCompleteOptionIndex = this.state.activeAutoCompleteOptions.length - 1;
      }

      this.setState({
        activeAutoCompleteOptionIndex: newActiveAutoCompleteOptionIndex
      }, this.repositionAutoCompleteContainerToActiveOption);
    }
  }

  filterAutoCompleteOptions(autoCompleteOptions) {
    let filteredOptions = [];

    if (this.props.useFiltering && (this.state.inputValue !== '' || this.props.multiple)) {
      if (isArray(autoCompleteOptions) && autoCompleteOptions.length > 0) {
        if (this.props.optionsFilter) {
          filteredOptions = this.props.optionsFilter(this.state.inputValue, autoCompleteOptions);
        } else {
          const alreadySelectedValues = [];

          if (this.props.multiple && isArray(this.props.value)) {
            this.props.value.forEach((valueObject) => {
              alreadySelectedValues.push(valueObject.display.toLowerCase());
            });
          }

          filteredOptions = autoCompleteOptions.filter((autoCompleteOption) => (
            (
              autoCompleteOption.display.toLowerCase().indexOf(this.state.inputValue.toLowerCase()) !== -1
              && alreadySelectedValues.indexOf(autoCompleteOption.display.toLowerCase()) === -1
            )
            || autoCompleteOption.isNew === true
          ));
        }
      }
    } else {
      filteredOptions = cloneDeep(autoCompleteOptions);
    }

    return filteredOptions;
  }

  repositionAutoCompleteContainerToActiveOption() {
    const activeOptionsSelector = `.extend-text__auto-complete-option:nth-child(${(this.state.activeAutoCompleteOptionIndex + 1)})`;
    const autoCompleteContainerNode = ReactDOM.findDOMNode(this.refs.container).querySelector('.extend-text__auto-complete-container');
    const activeOptionNode = ReactDOM.findDOMNode(this.refs.container).querySelector(activeOptionsSelector);

    if (activeOptionNode) {
      autoCompleteContainerNode.scrollTop = activeOptionNode.offsetTop;
    }
  }

  closeAutoComplete(currentValue = this.props.value, newState = {}) {
    Object.assign(newState, {
      isActive: false,
      activeAutoCompleteOptionIndex: null,
      activeAutoCompleteOptions: null,
      lastCheckedInputValue: null,
      inputValue: this.getDisplayValue(this.props.multiple, currentValue)
    });

    ReactDOM.findDOMNode(this.refs.input).blur();

    this.setState(newState);
  }

  getExactMatchAutoCompleteOptionIndex(inputValue, autoCompleteOptions) {
    let index = -1;

    if (inputValue !== '' && isArray(autoCompleteOptions) && autoCompleteOptions.length > 0) {
      autoCompleteOptions.forEach((autoCompleteOption, key) => {
        if (index !== -1) {
          return;
        }

        if (autoCompleteOption.display.toLowerCase() === inputValue.toLowerCase()) {
          index = key;
        }
      });
    }

    return index;
  }

  getDisplayValue(allowsMultiple, values) {
    return !allowsMultiple && isArray(values) && values.length > 0 ? values[0].display : '';
  }

  renderAutoComplete() {
    const processAutoCompleteOptions = (options) => {
      const optionNodes = [];

      options.forEach((option, key) => {
        let displayNode = null;

        if (this.props.optionRenderer) {
          displayNode = this.props.optionRenderer(option);
        } else {
          displayNode = option.display;
        }

        optionNodes.push(
          <ExtendTextAutoCompleteOption
            isActive={key === this.state.activeAutoCompleteOptionIndex}
            key={key}
            data-index={key}
            onMouseEnter={this.onMouseEnterAutoCompleteOption}
            onClick={this.onMouseDownAutoCompleteOption}
          >
            {displayNode}
          </ExtendTextAutoCompleteOption>
        );
      });

      return optionNodes;
    };

    if (!this.state.isActive) {
      return null;
    }

    let children = [];

    if (this.state.isLoading) {
      children.push(
        <div
          key="loading-node"
          className="extend-text__auto-complete-help-text u-muted-text"
        >
          {this.props.loadingNode}
        </div>
      );
    } else if (
      this.state.inputValue.length < this.props.characterThreshold
      && (
        !this.state.activeAutoCompleteOptions
        || this.state.activeAutoCompleteOptions.length === 0
      )
    ) {
      children.push(
        <div
          key="searching-node"
          className="extend-text__auto-complete-help-text u-muted-text"
        >
          {this.props.typeForSearchingNode}
        </div>
      );
    } else {
      const renderableOptions = this.props.useFiltering && this.props.isSearchable && this.props.options.length > 0
        ? this.filterAutoCompleteOptions(this.state.activeAutoCompleteOptions)
        : this.state.activeAutoCompleteOptions;

      if (renderableOptions && renderableOptions.length > 0) {
        children = processAutoCompleteOptions(renderableOptions);
      } else {
        children.push(
          <div
            key="no-options-node"
            className="extend-text__auto-complete-help-text u-muted-text"
          >{
            this.props.noOptionsNode}
          </div>
        );
      }
    }

    return (
      <div
        ref="autoCompleteContainer"
        className="extend-text__auto-complete-container"
      >
        {children}
      </div>
    );
  }

  renderTags() {
    if (!this.props.multiple || !isArray(this.props.value) || this.props.value.length === 0) {
      return null;
    }

    let tagNodes = [];

    this.props.value.forEach((valueObject, key) => {
      const deleteNode = (
        <SvgIcon
          className="extend-text__tag-delete"
          data-key={key}
          fragment="times"
          onClick={this.onClickDeleteTag}
        />
      );
      let tagNode = (
        <span>
          {deleteNode}{valueObject.display}
        </span>
      );

      if (this.props.tagRenderer) {
        tagNode = this.props.tagRenderer(valueObject, deleteNode);
      }

      tagNodes.push(
        <Badge
          key={key}
          className="extend-text__tag"
        >
          {tagNode}
        </Badge>
      );
    });

    let clearAllNode = null;

    if (this.props.clearable && tagNodes.length > 0) {
      clearAllNode = (
        <Button
          styleType="link"
          onClick={this.onClickClearAll}
        >
          Clear all
        </Button>
      );
    }

    return (
      <span>
        {clearAllNode}
        <div className="extend-text__tags-container">
          {tagNodes}
        </div>
      </span>
    );
  }

  renderLoadingIndicator() {
    if (!this.state.isLoading) {
      return null;
    }

    return (
      <svg
        className="extend-text__loading-indicator"
        x="0px"
        y="0px"
        viewBox="0 0 40 40"
        dangerouslySetInnerHTML={{
          __html: loadingSvg
        }}
      />
    );
  }

  render() {
    let gutsNode = null;

    if (this.props.autoCompletePosition === 'top') {
      gutsNode = (
        <span>
          <div className="extend-text__input-container">
            <FormTextbox
              ref="input"
              onFocus={this.onFocusInput}
              onKeyDown={this.onKeyDown}
              value={this.state.inputValue}
              onChange={this.onChangeInput}
              readOnly={!this.props.isSearchable}
              disabled={this.props.disabled}
              placeholder={this.props.placeholder}
            />
            {this.renderLoadingIndicator()}
            <SvgIcon
              ref="dropDownIndicator"
              onClick={this.onClickDropDownIndicator}
              fragment="caret-down"
              className="extend-text__drop-down-indicator"
            />
            {this.renderAutoComplete()}
          </div>
          {this.renderTags()}
        </span>
      );
    } else {
      gutsNode = (
        <span>
          {this.renderTags()}
          <div className="extend-text__input-container">
            <FormTextbox
              ref="input"
              onFocus={this.onFocusInput}
              onKeyDown={this.onKeyDown}
              value={this.state.inputValue}
              onChange={this.onChangeInput}
              readOnly={!this.props.isSearchable}
              disabled={this.props.disabled}
              placeholder={this.props.placeholder}
            />
            {this.renderLoadingIndicator()}
            <SvgIcon
              ref="dropDownIndicator"
              onClick={this.onClickDropDownIndicator}
              fragment="caret-down"
              className="extend-text__drop-down-indicator"
            />
            {this.renderAutoComplete()}
          </div>
        </span>
      );
    }

    return (
      <div
        ref="container"
        className={this.getCssClasses()}
        {...getPassThroughProperties(this.props, ExtendText.propTypes)}
      >
        {gutsNode}
      </div>
    );
  }
}

ExtendText.propTypes = {
  className: React.PropTypes.string,
  options: React.PropTypes.array,
  asyncOptions: React.PropTypes.func,
  value: React.PropTypes.array,
  onChange: React.PropTypes.func,
  characterThreshold: React.PropTypes.number,
  isSearchable: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  useFiltering: React.PropTypes.bool,
  optionsFilter: React.PropTypes.func,
  optionRenderer: React.PropTypes.func,
  tagRenderer: React.PropTypes.func,
  allowCreate: React.PropTypes.bool,
  createTemplate: React.PropTypes.string,
  multiple: React.PropTypes.bool,
  placeholder: React.PropTypes.string,
  addTagOnKeyCode: React.PropTypes.number,
  loadingNode: React.PropTypes.node,
  typeForSearchingNode: React.PropTypes.node,
  noOptionsNode: React.PropTypes.node,
  autoCompletePosition: React.PropTypes.oneOf(['bottom', 'top']),
  clearable: React.PropTypes.bool
};

ExtendText.defaultProps = {
  className: null,
  options: [],
  asyncOptions: null,
  value: [],
  onChange: null,
  characterThreshold: 0,
  isSearchable: true,
  disabled: false,
  useFiltering: true,
  optionsFilter: null,
  optionRenderer: null,
  tagRenderer: null,
  allowCreate: false,
  createTemplate: 'Add new item \'%%value%%\'?',
  multiple: false,
  placeholder: '',
  addTagOnKeyCode: null,
  loadingNode: 'Loading options...',
  typeForSearchingNode: 'Start typing for auto complete list',
  noOptionsNode: 'No options found',
  autoCompletePosition: 'bottom',
  clearable: false
};

export default ExtendText;
