// Copyright 2017 yubo. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/* https://github.com/chrisui/react-hotkeys/blob/master/docs/getting-started.md */
import React from 'react'
import PropTypes from 'prop-types'
import Expr from './expr'
import { HotKeys } from 'react-hotkeys'
import { Modal } from 'antd'
import './app.scss'

const TOTAL = 20

export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cur: 0,
      ok: 0,
      total: TOTAL,
      start_time: new Date(),
      time: new Date(),
      stop: true,
    }
  }

  componentDidMount() {
    //this.timer = setInterval( () => this.tick(), 100);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  tick = () => {
    if (!this.state.stop)
      this.setState({ time: new Date() })
  }

  restart = () => {
    this.setState({
      cur: 0,
      ok: 0,
      start_time: new Date(),
      stop: false,
    })
  }

  stop = () => {
    this.setState({
      stop: true,
      time: new Date(),
    })
  }

  setTotal = (total) => {
    this.setState({total})
  }

  setCounter = (cur, ok) => {
    this.setState({cur, ok})
  }

  static propTypes = {
  }

   
  keyMap = {
    'option1': ['up', 'j', '1'],
    'option2': ['right', 'k', '2'],
    'option3': ['down', 'l', '3'],
    'option4': ['left', ';', '4'],
    'start': ['s'],
    'restart': ['r'],
    'stop': ['esc'],
    'help': ['?', 'h'],
  }

  keyHandlers = {
    'help': () => {
      this.hotKeysList()
    },
  }

  hotKeysList = () => {
    const content = Object.keys(this.keyMap).map((desc) => {
      const keys = this.keyMap[desc].map((key) => {
        return <li key={key}>{key}</li>
      })
      return <ul key={desc}>{desc} {keys}</ul>
    })
    Modal.info({
      title: 'hot keys list',
      content: (<div>{content}</div>)
    })
  }

  render() {
    const time = (this.state.time.getTime() - this.state.start_time.getTime()) / 1000
    return (
      <HotKeys focused={true} attach={window} keyMap={this.keyMap} handlers={this.keyHandlers} style={{outline:'none'}}>
        <div className="core-container">
          <div className='header'>
            <div className='container header'>
              <div className='header-counter'> 已完成： {this.state.cur + '/' + this.state.total} </div>
              <div className='header-counter'> 正确率： {this.state.ok + '/' + this.state.cur} </div>
              <div className='header-counter'> 耗时： {this.state.stop ? time.toFixed(2) + 's' : '--'} </div>
              <div className='header-counter'> 平均耗时： {this.state.stop ? (this.state.cur > 0 ? (time / this.state.cur).toFixed(2) + 's' : 'N/A') : '--'} </div>
            </div>
          </div>

          <div className="content-container container">
            <div className="main-content">
              <Expr 
                  cur={this.state.cur}
                  ok={this.state.ok}
                  stop={this.state.stop}
                  total={this.state.total}
                  setTotal={this.setTotal}
                  restart={this.restart}
                  stopHandle={this.stop}
                  setCounter={this.setCounter}
                  />
            </div>
          </div>
        </div>
      </HotKeys>
    )
  }
}

export default App
