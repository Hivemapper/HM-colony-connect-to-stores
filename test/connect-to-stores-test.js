import { jsdom } from 'jsdom'
import Alt from 'alt'
import React from 'react';
import ReactDOM from 'react-dom'
import ReactTestUtils from 'react-dom/test-utils'
import ReactDOMServer from 'react-dom/server';
import createReactClass from 'create-react-class'
import connectToStores from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const testActions = alt.generateActions('updateFoo')

const testStore = alt.createStore(
  class TestStore {
    constructor() {
      this.bindAction(testActions.updateFoo, this.onChangeFoo)
      this.foo = 'Bar'
    }
    onChangeFoo(newValue) {
      this.foo = newValue
    }
  }
)

export default {
  'connectToStores wrapper': {
    beforeEach() {
      global.document = jsdom('<!doctype html><html><body></body></html>')
      global.window = global.document.parentWindow
      global.navigator = global.window.navigator
      //require('react/lib/ExecutionEnvironment').canUseDOM = true

      alt.recycle()
    },

    afterEach() {
      delete global.document
      delete global.window
      delete global.navigator
    },

    'resolve props on re-render'() {
      const FooStore = alt.createStore(function () {
        this.x = 1
      }, 'FooStore')

      const Child = connectToStores(createReactClass({
        statics: {
          getStores(props) {
            return [FooStore]
          },
        },
        render() {
          return <span>{this.props.x + this.props.y}</span>
        }
      }))

      const Parent = createReactClass({
        getInitialState() {
          return { y: 0 }
        },
        componentDidMount() {
          this.setState({ y: 1 })
        },
        render() {
          return <Child y={this.state.y} />
        }
      })

      const node = ReactTestUtils.renderIntoDocument(
        <Parent />
      )

      const span = ReactTestUtils.findRenderedDOMComponentWithTag(node, 'span')
      assert(span.innerHTML === '2', 'prop passed in is correct')
    },

    'missing the static getStores() method should throw'() {
      const BadComponentOne = createReactClass({
        render() {
          return React.createElement('div', null, 'Bad')
        }
      })

      assert.throws(() => connectToStores(BadComponentOne), 'expects the wrapped component to have a static getStores() method')
    },

    'element mounts and unmounts'() {
      const div = document.createElement('div')

      const LegacyComponent = connectToStores(createReactClass({
        statics: {
          getStores() {
            return [testStore]
          },
        },
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      }))

      ReactDOM.render(
        <LegacyComponent />
      , div)

      ReactDOM.unmountComponentAtNode(div)
    },

    'createClass() component can get props from stores'() {
      const LegacyComponent = createReactClass({
        statics: {
          getStores() {
            return [testStore]
          },
        },
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      })

      const WrappedComponent = connectToStores(LegacyComponent)
      const element = React.createElement(WrappedComponent, {delim: ': '})
      const output = ReactDOMServer.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'component can get use stores from props'() {
      const LegacyComponent = createReactClass({
        statics: {
          getStores(props) {
            return [props.store]
          },
        },
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      })

      const WrappedComponent = connectToStores(LegacyComponent)
      const element = React.createElement(WrappedComponent, {delim: ': ', store: testStore})
      const output = ReactDOMServer.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'ES6 class component responds to store events'() {
      class ClassComponent extends React.Component {
        static getStores() {
          return [testStore]
        }
        render() {
          return <span>{this.props.foo}</span>;
        }
      }

      const WrappedComponent = connectToStores(ClassComponent)

      const node = ReactTestUtils.renderIntoDocument(
        <WrappedComponent />
      )

      testActions.updateFoo('Baz')

      const span = ReactTestUtils.findRenderedDOMComponentWithTag(node, 'span')

      assert(span.innerHTML === 'Baz')
    },

    'componentDidConnect hook is called '() {
      let componentDidConnect = false
      class ClassComponent extends React.Component {
        static getStores() {
          return [testStore]
        }
        static componentDidConnect() {
          componentDidConnect = true
        }
        render() {
          return <span foo={this.props.foo} />
        }
      }
      const WrappedComponent = connectToStores(ClassComponent)
      const node = ReactTestUtils.renderIntoDocument(
        <WrappedComponent />
      )
      assert(componentDidConnect === true)
    },

    'Component receives all updates'(done) {
      let componentDidConnect = false
      class ClassComponent extends React.Component {
        static getStores() {
          return [testStore]
        }
        static componentDidConnect() {
          testActions.updateFoo('Baz')
          componentDidConnect = true
        }
        componentDidUpdate() {
          assert(this.props.foo === 'Baz')
          done()
        }
        render() {
          return <span foo={this.props.foo} />
        }
      }

      const WrappedComponent = connectToStores(ClassComponent)

      let node = ReactTestUtils.renderIntoDocument(
        <WrappedComponent />
      )

      const span = ReactTestUtils.findRenderedDOMComponentWithTag(node, 'span')
      assert(componentDidConnect === true)
    },


  }
}
