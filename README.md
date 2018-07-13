# connectToStores (for alt)

'Higher Order Component' for alt flux that controls the props of a wrapped
component via stores.

**Alt** is an Isomorphic flux implementation.

Check out the [API Reference](http://alt.js.org/docs/) for full in-depth alt docs. For a high-level walk-through on flux, take a look at the [Getting Started](http://alt.js.org/guide/) guide.

## How to use

Expects the Component to have the following static method:
 - getStores(): Should return an array of stores.

**Using old React.createClass() style:**

```js
const MyComponent = React.createClass({
  statics: {
    getStores(props) {
      return [myStore]
    },
  },
  render() {
    // Use this.props like normal ...
  }
})
MyComponent = connectToStores(MyComponent)
```

**Using ES6 Class:**

```js
class MyComponent extends React.Component {
  static getStores(props) {
    return [myStore]
  }
  render() {
    // Use this.props like normal ...
  }
}
MyComponent = connectToStores(MyComponent)
```

**Using ES7 Decorators (proposal, stage 0):**

```js
@connectToStores
class MyComponent extends React.Component {
  static getStores(props) {
    return [myStore]
  }
  render() {
    // Use this.props like normal ...
  }
}
```

A great explanation of the merits of higher order components can be found at
http://bit.ly/1abPkrP


## License

[![MIT](https://img.shields.io/npm/l/alt.svg?style=flat)](http://josh.mit-license.org)
