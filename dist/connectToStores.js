'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

var getPropsFromStores = function getPropsFromStores(Component, props, context) {
  return assign.apply(undefined, [{}].concat(_toConsumableArray(Component.getStores(props, context).map(function (store) {
    return store.getState();
  }))));
};

function connectToStores(Component) {
  // Check for required static methods.
  if (!isFunction(Component.getStores)) {
    throw new Error('connectToStores() expects the wrapped component to have a static getStores() method');
  }

  var StoreConnection = function (_React$Component) {
    _inherits(StoreConnection, _React$Component);

    function StoreConnection(props, context) {
      _classCallCheck(this, StoreConnection);

      var _this = _possibleConstructorReturn(this, (StoreConnection.__proto__ || Object.getPrototypeOf(StoreConnection)).call(this, props, context));

      _this.state = getPropsFromStores(Component, _this.props, _this.context);
      _this.onChange = _this.onChange.bind(_this);
      return _this;
    }

    _createClass(StoreConnection, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(nextProps) {
        this.setState(getPropsFromStores(Component, this.props, this.context));
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        var _this2 = this;

        var stores = Component.getStores(this.props, this.context);
        this.storeListeners = stores.map(function (store) {
          return store.listen(_this2.onChange);
        });
        if (Component.componentDidConnect) {
          Component.componentDidConnect(this.props, this.context);
        }
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.storeListeners.forEach(function (unlisten) {
          return unlisten();
        });
      }
    }, {
      key: 'onChange',
      value: function onChange() {
        try {
          this.setState(getPropsFromStores(Component, this.props, this.context));
        } catch (e) {
          console.error(e);
          if (typeof Rollbar !== 'undefined') {
            Rollbar.error(e);
          }
        }
      }
    }, {
      key: 'render',
      value: function render() {
        try {
          return React.createElement(Component, assign({}, this.props, this.state));
        } catch (e) {
          console.error(e);
          if (typeof Rollbar !== 'undefined') {
            Rollbar.error(e);
          }
        }
      }
    }]);

    return StoreConnection;
  }(React.Component);

  return StoreConnection;
}

module.exports = connectToStores;
