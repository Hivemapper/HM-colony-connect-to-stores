'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

// @todo Where to get these from?
var isFunction = function isFunction(x) {
  return typeof x === 'function';
};
var eachObject = function eachObject(f, o) {
  o.forEach(function (from) {
    Object.keys(Object(from)).forEach(function (key) {
      f(key, from[key]);
    });
  });
};
var assign = function assign(target) {
  for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    source[_key - 1] = arguments[_key];
  }

  eachObject(function (key, value) {
    return target[key] = value;
  }, source);
  return target;
};

function connectToStores(Spec) {
  var Component = arguments[1] === undefined ? Spec : arguments[1];
  return (function () {
    // Check for required static methods.
    if (!isFunction(Spec.getStores)) {
      throw new Error('connectToStores() expects the wrapped component to have a static getStores() method');
    }

    if (!isFunction(Spec.getPropsFromStores)) {
      Spec.getPropsFromStores = function () {
        return assign.apply(undefined, [{}].concat(_toConsumableArray(Spec.getStores().map(function (store) {
          return store.getState();
        }))));
      };
    }

    var StoreConnection = _react2['default'].createClass({
      displayName: 'StoreConnection',

      getInitialState: function getInitialState() {
        return Spec.getPropsFromStores(this.props, this.context);
      },

      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.setState(Spec.getPropsFromStores(nextProps, this.context));
      },

      componentDidMount: function componentDidMount() {
        var _this = this;

        var stores = Spec.getStores(this.props, this.context);
        this.storeListeners = stores.map(function (store) {
          return store.listen(_this.onChange);
        });
        if (Spec.componentDidConnect) {
          Spec.componentDidConnect(this.props, this.context);
        }
      },

      componentWillUnmount: function componentWillUnmount() {
        this.storeListeners.forEach(function (unlisten) {
          return unlisten();
        });
      },

      onChange: function onChange() {
        try {
          this.setState(Spec.getPropsFromStores(this.props, this.context));
        } catch (e) {
          console.error(e);
          if (typeof Rollbar !== 'undefined') {
            Rollbar.error(e);
          }
        }
      },

      render: function render() {
        try {
          return _react2['default'].createElement(Component, assign({}, this.props, this.state));
        } catch (e) {
          console.error(e);
          if (typeof Rollbar !== 'undefined') {
            Rollbar.error(e);
          }
        }
      }
    });

    return StoreConnection;
  })();
}

exports['default'] = connectToStores;
module.exports = exports['default'];