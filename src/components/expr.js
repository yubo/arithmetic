import React from 'react'
import PropTypes from 'prop-types'
import { HotKeys } from 'react-hotkeys'
import { fromJS } from 'immutable'
import { Modal, Button, Icon, Select } from 'antd';
const { Option } = Select;
import './expr.scss'

const OP_PLUS = 0
const OP_SUB  = 1
const OP_TIMES = 2
const OP_DIV  = 3

class Expr extends React.Component {
  constructor (props) {
    super(props)
    this.state ={
      expressions: fromJS([{
        expr: '1+1',
        value: 2,
        options: [4,2,5,1], /* up, right, down, left */
        idx: 1,
        inputIdx: -1,
      }]),
      max: 10,
      maxResult: 20,
      opNum: 1,
      op: 1,
    }
  }

  static propTypes = {
    cur: PropTypes.number.isRequired,
    ok: PropTypes.number.isRequired,
    stop: PropTypes.bool.isRequired,
    total: PropTypes.number.isRequired,
    setTotal: PropTypes.func.isRequired,
    restart: PropTypes.func.isRequired,
    stopHandle: PropTypes.func.isRequired,
    setCounter: PropTypes.func.isRequired,
  }

  componentDidMount() {
  }

  /* [l, u) */
  rand = (u=10, l=0) => {
    return Math.floor(Math.random() * (u-l)) + l
  }

  getNum = (max) => {
    const limit= this.state.max
    if (max > limit) {
      max = limit 
    }
    if (max < 1) {
      return 1
    }
    return this.rand(max, 1)
  }

  getOp = () => {
    return this.rand(this.state.op)
  }



  /* expression generate */
  expr_gen = (l, maxResult) => {
    if (l == 0) {
      const value  = this.getNum(maxResult)
      return {value, expr:value.toString()}
    }

    if (l == 1) {
      const left = this.getNum(maxResult)
      const op = this.getOp()
      let right
      switch (op) {
        case OP_PLUS:
          right = this.getNum(maxResult-left)
          return {value: left + right, expr: '(' + left + ' + ' + right + ')'}
        case OP_SUB:
          right = this.getNum(left)
          return {value: left - right, expr: '(' + left + ' - ' + right + ')'}
        case OP_TIMES:
          right = this.getNum(maxResult / (left == 0 ? 1 : left))
          return {value: left * right, expr: '(' + left + ' * ' + right + ')'}
        case OP_DIV:
          return {}
      }
    }

    const n = this.rand(l) 
    const left = this.expr_gen(n, maxResult)
    const op = this.getOp()
    let right
    switch (op) {
       case OP_PLUS:
          right = this.expr_gen(l-n-1, maxResult-left.value)
          return {value: left.value + right.value, expr: '(' + left.expr + ' + ' + right.expr + ')'}
        case OP_SUB:
          right = this.expr_gen(l-n-1, left.value)
          return {value: left.value - right.value, expr: '(' + left.expr + ' - ' + right.expr + ')'}
        case OP_TIMES:
          right = this.expr_gen(l-n-1, maxResult / left.value)
          return {value: left.value * right.value, expr: '(' + left.expr + ' * ' + right.expr + ')'}
        case OP_DIV:
          return {}
    }
  }

  expr_fill_options = (e) => {
    let options = [e.value, 0, 0, 0]
    const range = 5

    for (let i = 1; i < 4; i++) {
      let n
      do {
        n = this.rand(e.value + range, e.value - range)
        if (n < 0)
          n = -n
      }while(options.findIndex((e) => {return e == n}) != -1)
      options[i] = n
    }

    const idx = this.rand(4)
    const t = options[idx]
    options[idx] = options[0]
    options[0] = t

    e.idx = idx
    e.options = options
    e.inputIdx = -1
    return e
  }


  start = () => {
    let expressions = []
    this.props.restart()
    for (let i = 0; i < this.props.total; i++) {
      expressions.push(this.expr_fill_options(
        this.expr_gen(this.state.opNum, this.state.maxResult)))
    }
    this.setState({expressions: fromJS(expressions)})
  }

  stop = (cur) => {

    this.props.stopHandle()

    if (!cur)
      cur = this.props.cur
    const total = this.props.total
    const content = this.state.expressions.toJS().map((item, index) =>
      <div key={index} className={index == cur ? 'expr-row expr-row-cur' : 'expr-row'}>
        <div className='expr-item-str'> {item.expr.slice(1, -1)} </div>
        <div className={this.options_css(0, item.idx, item.inputIdx, index, cur)}
          onClick={index == cur ? ()=>{this.input(0)} : () => {}}> {item.options[0]} </div>
        <div className={this.options_css(1, item.idx, item.inputIdx, index, cur)}
          onClick={index == cur ? ()=>{this.input(1)} : () => {}}> {item.options[1]} </div>
        <div className={this.options_css(2, item.idx, item.inputIdx, index, cur)}
          onClick={index == cur ? ()=>{this.input(2)} : () => {}}> {item.options[2]} </div>
        <div className={this.options_css(3, item.idx, item.inputIdx, index, cur)}
          onClick={index == cur ? ()=>{this.input(3)} : () => {}}> {item.options[3]} </div>
      </div>
    )

    Modal.info({
      title: '答题结果',
      content: (<div>{content}</div>)
    })
  }

  input = (idx) => {
    let cur = this.props.cur
    let ok = this.props.ok
    const total = this.props.total

    if (cur == total) {
      return
    }

    this.setState({
      expressions: this.state.expressions.setIn([cur, 'inputIdx'], idx),
    })

    if (this.state.expressions.getIn([cur, 'idx']) == idx) {
      ok = ok + 1
    }
    cur = cur + 1
    this.props.setCounter(cur, ok)

    if (cur == total) {
      this.stop(cur)
    }
  }

  keyHandlers = {
    'option1': () => {
      this.input(0)
    },
    'option2': () => {
      this.input(1)
    },
    'option3': () => {
      this.input(2)
    },
    'option4': () => {
      this.input(3)
    },
    'restart': () => {
      this.start()
    },
    'stop': () => {
      this.stop()
    },
  }

  options_css = (n, want, got, idx, cur_idx) => {
    if (idx >= cur_idx) {
      return 'expr-item'
    }
    /* ok */
    if (n == got && n == want) {
        return 'expr-item-ok expr-item'
    } else if (n == want) {
      return 'expr-item-want expr-item'
    } else if (n == got) {
      return 'expr-item-wrong expr-item'
    } else {
      return 'expr-item'
    } 
  }

  onChangeMax = (max) => {
    this.setState({ max: parseInt(max) })
  }
  onChangeMaxResult = (maxResult) => {
    this.setState({ maxResult: parseInt(maxResult) })
  }
  onChangeOpNum = (value) => {
    const opNum = parseInt(value)
    this.setState({opNum})
  }
  onChangeOp = (op) => {
    this.setState({ op: parseInt(op) })
  }
  onChangeTotal = (total) => {
    this.props.setTotal(parseInt(total))
  }

  render () {
    const cur = this.props.cur
    const total = this.props.total
    const stop = this.props.stop
    const page = Math.floor(cur / 10)
    const low = page * 10
    const upper = low + 10 > total ? total : low + 10
    const cur_index = cur - low

    let exprs = this.state.expressions.toJS().slice(low , upper).map((item, index) => 
      <div key={index} className={index == cur_index ? 'expr-row expr-row-cur' : 'expr-row'}>
        <div className='expr-item-str'> {item.expr.slice(1, -1)} </div>
        <div className={this.options_css(0, item.idx, item.inputIdx, index, cur_index)}
          onClick={index == cur_index ? ()=>{this.input(0)} : () => {}}> {item.options[0]} </div>
        <div className={this.options_css(1, item.idx, item.inputIdx, index, cur_index)}
          onClick={index == cur_index ? ()=>{this.input(1)} : () => {}}> {item.options[1]} </div>
        <div className={this.options_css(2, item.idx, item.inputIdx, index, cur_index)}
          onClick={index == cur_index ? ()=>{this.input(2)} : () => {}}> {item.options[2]} </div>
        <div className={this.options_css(3, item.idx, item.inputIdx, index, cur_index)}
          onClick={index == cur_index ? ()=>{this.input(3)} : () => {}}> {item.options[3]} </div>
      </div>
    )
    return (
      <HotKeys className='expr-container' handlers={this.keyHandlers} style={{outline:'none', height:'100vh'}}>
        <div className='expr-container'>
          <div className='expr-options'>
            <div className='expr-option'>
              <span style={{marginRight:'5px'}}>算子最大值</span>
              <Select defaultValue={this.state.max.toString()}
                onChange={this.onChangeMax} style={{ width: 50}}
                disabled={!stop} >
                <Option value="5"> 5 </Option>
                <Option value="10"> 10 </Option>
                <Option value="15"> 15 </Option>
                <Option value="20"> 20 </Option>
                <Option value="40"> 40 </Option>
              </Select>
            </div>
            <div className='expr-option'>
              <span style={{marginRight:'5px'}}>结果最大值</span>
              <Select defaultValue={this.state.maxResult.toString()}
                onChange={this.onChangeMaxResult} style={{ width: 50}}
                disabled={!stop} >
                <Option value="10"> 10 </Option>
                <Option value="20"> 20 </Option>
                <Option value="40"> 40 </Option>
              </Select>
            </div>
            <div className='expr-option'>
              <span style={{marginRight:'5px'}}>操作符</span>
              <Select defaultValue={this.state.op.toString()}
                onChange={this.onChangeOp} style={{ width: 60}}
                disabled={!stop} >
                <Option value="1"> + </Option>
                <Option value="2"> + - </Option>
                <Option value="3"> + - &times; </Option>
                <Option value="4" disabled> + - &times; &divide; </Option>
              </Select>
            </div>
             <div className='expr-option'>
              <span style={{marginRight:'5px'}}>操作符个数</span>
              <Select defaultValue={this.state.opNum.toString()}
                 onChange={this.onChangeOpNum} style={{ width: 50}}
                disabled={!stop} >
                <Option value="1"> 1 </Option>
                <Option value="2"> 2 </Option>
                <Option value="3"> 3 </Option>
                <Option value="4"> 4 </Option>
                <Option value="5"> 5 </Option>
              </Select>
            </div>
            <div className='expr-option'>
              <span style={{marginRight:'5px'}}>total</span>
              <Select defaultValue={this.props.total.toString()}
                onChange={this.onChangeTotal} style={{ width: 60}}
                disabled={!stop} >
                <Option value="10"> 10 </Option>
                <Option value="20"> 20 </Option>
                <Option value="50"> 50 </Option>
                <Option value="100"> 100 </Option>
              </Select>
            </div>
          </div>
          {stop ?
            <div className='play-ico'> <Icon type="play-circle-o" onClick={this.start}/> </div>:
            <div className='expr-rows'>
              <div className='expr-row'>
                <div className='expr-item-str'> 算术式 </div>
                <div className='expr-item'> 选项1  </div>
                <div className='expr-item'> 选项2  </div>
                <div className='expr-item'> 选项3  </div>
                <div className='expr-item'> 选项4  </div>
              </div>
              {exprs}
              <div className='expr-row'>
                <Button type='primary' onClick={this.stop} style={{width:'100%', marginTop:'50px'}}>提交</Button>
              </div>
            </div>}
        </div>
      </HotKeys>
    )
  }
}

export default Expr
