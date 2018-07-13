import React from 'react'

// @todo Where to get these from?
const isFunction = x => typeof x === 'function'
const eachObject = (f, o) => {
  o.forEach((from) => {
    Object.keys(Object(from)).forEach((key) => {
      f(key, from[key])
    })
  })
}
const assign = (target, ...source) => {
  eachObject((key, value) => target[key] = value, source)
  return target
}

const getPropsFromStores = (Component, props, context) => {
  return assign({}, ...Component.getStores(props, context).map((store) => {
    return store.getState();
  }));
}

function connectToStores(Component) {
  // Check for required static methods.
  if (!isFunction(Component.getStores)) {
    throw new Error('connectToStores() expects the wrapped component to have a static getStores() method')
  }

  class StoreConnection extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.state = getPropsFromStores(Component, this.props, this.context);
      this.onChange = this.onChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
      this.setState(getPropsFromStores(Component, this.props, this.context))
    }

    componentDidMount() {
      const stores = Component.getStores(this.props, this.context)
      this.storeListeners = stores.map((store) => {
        return store.listen(this.onChange)
      })
      if (Component.componentDidConnect) {
        Component.componentDidConnect(this.props, this.context)
      }
    }

    componentWillUnmount() {
      this.storeListeners.forEach(unlisten => unlisten())
    }

    onChange() {
      try {
        this.setState(getPropsFromStores(Component, this.props, this.context));
      } catch (e) {
        console.error(e);
        if (typeof Rollbar !== 'undefined') {
          Rollbar.error(e);
        }
      }
    }

    render() {
      try {
        return React.createElement(
          Component,
          assign({}, this.props, this.state)
        );
      } catch (e) {
        console.error(e);
        if (typeof Rollbar !== 'undefined') {
          Rollbar.error(e);
        }
      }
    }
  }

  return StoreConnection;
}

export default connectToStores;
