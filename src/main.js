import React from 'react'
import ReactDOM from 'react-dom'
import enUS from 'antd/lib/locale-provider/en_US'
import { LocaleProvider } from 'antd'
//import './styles/main.scss'

// Render Setup
// ------------------------------------
const MOUNT_NODE = document.getElementById('root')

let render = () => {
  const App = require('./components/app').default

  ReactDOM.render(
    <LocaleProvider locale={enUS}>
      <App />
    </LocaleProvider>,
    MOUNT_NODE
  )
}

// Development Tools
// ------------------------------------
if (__DEV__) {
  if (module.hot) {
    const renderApp = render
    const renderError = (error) => {
      const RedBox = require('redbox-react').default

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE)
    }

    render = () => {
      try {
        renderApp()
      } catch (e) {
        renderError(e)
      }
    }

    // Setup hot module replacement
    module.hot.accept([
      './components/app',
    ], () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE)
        render()
      })
    )
  }
}

// Let's Go!
// ------------------------------------
if (!__TEST__) render()
