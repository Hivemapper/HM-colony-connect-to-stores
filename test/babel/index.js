require('babel-register');
require('raf/polyfill');
const jsdom = require('jsdom').jsdom;

global.document = jsdom('<!doctype html><html><body></body></html>')
global.window = global.document.parentWindow
global.navigator = global.window.navigator
