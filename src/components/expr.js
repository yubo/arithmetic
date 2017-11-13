import React from 'react'
import PropTypes from 'prop-types'
import { HotKeys } from 'react-hotkeys'
import { fromJS } from 'immutable'
import { Select } from 'antd';
const { Option, OptGroup } = Select;
import './expr.scss'

const OP_PLUS = -1
const OP_SUB = -2
const OP_MULT = -3
const OP_DIV = -4

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
    }
  }

  static propTypes = {
    cur: PropTypes.number.isRequired,
    ok: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    resetCounter: PropTypes.func.isRequired,
    setCounter: PropTypes.func.isRequired,
    doneCounter: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.reset(this.state.opNum, this.state.max, this.state.maxResult, this.props.total)
  }

  /* [l, u) */
  rand = (u=10, l=0) => {
    return Math.floor(Math.random() * (u-l)) + l
  }

  getNum = (max, max1) => {
    console.log('----', max, this.state.max)
    if (max > max1) {
      max = max1
    }
    return this.rand(max, 1)
  }

  getOp = () => {
    return -this.rand(4, 1)
  }



  /* expression generate */
  expr_gen = (l, maxResult, max) => {
    if (l == 0) {
      const value  = this.getNum(maxResult, max)
      return {value, expr:value.toString()}
    }

    if (l == 1) {
      const left = this.getNum(maxResult, max)
      const op = this.getOp()
      let right
      switch (op) {
        case OP_PLUS:
          right = this.getNum(maxResult-left, max)
          return {value: left + right, expr: '(' + left + ' + ' + right + ')'}
        case OP_SUB:
          right = this.getNum(left, max)
          return {value: left - right, expr: '(' + left + ' - ' + right + ')'}
        case OP_MULT:
          right = this.getNum(maxResult / left, max)
          return {value: left * right, expr: '(' + left + ' * ' + right + ')'}
        case OP_DIV:
          return {}
      }
    }

    const n = this.rand(l) 
    const left = this.expr_gen(n, maxResult, max)
    const op = this.getOp()
    let right
    switch (op) {
       case OP_PLUS:
          right = this.expr_gen(l-n-1, maxResult-left.value, max)
          return {value: left.value + right.value, expr: '(' + left.expr + ' + ' + right.expr + ')'}
        case OP_SUB:
          right = this.expr_gen(l-n-1, left.value, max)
          return {value: left.value - right.value, expr: '(' + left.expr + ' - ' + right.expr + ')'}
        case OP_MULT:
          right = this.expr_gen(l-n-1, maxResult / left.value, max)
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


  reset = (opNum, max, maxResult, total) => {
    let expressions = []

    this.props.resetCounter(total)

    for (let i = 0; i < total; i++) {
      expressions.push(this.expr_fill_options(this.expr_gen(opNum, max, maxResult)))
    }
    this.setState({
      opNum,
      max,
      maxResult,
      expressions: fromJS(expressions),
    })
  }

  stop = () => {
    this.props.doneCounter()
  }

  input = (idx) => {
    let cur = this.props.cur
    let ok = this.props.ok
    const total = this.props.total

    if (cur == total) {
      return
    }

    if (cur + 1 == total) {
      this.stop()
    }

    this.setState({
      expressions: this.state.expressions.setIn([cur, 'inputIdx'], idx),
    })

    cur = cur + 1
    if (this.state.expressions.getIn([cur, 'idx']) == idx) {
      ok = ok + 1
    }
    this.props.setCounter(cur, ok)
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
      console.log('restart')
      this.reset(this.state.opNum, this.state.max, this.state.maxResult, this.props.total)
    },
    'stop': () => {
      console.log('stop')
      this.props.doneCounter()
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
    this.reset(this.state.opNum, parseInt(max), this.state.maxResult, this.props.total)
  }
  onChangeMaxResult = (maxResult) => {
    this.reset(this.state.opNum, this.state.max, parseInt(maxResult), this.props.total)
  }
  onChangeOpNum = (opNum) => {
    this.reset(parseInt(opNum), this.state.max, this.state.maxResult, this.props.total)
  }
  onChangeTotal = (total) => {
    this.reset(htis.state.opNum, this.state.max, this.state.maxResult, parseIn(total))
  }

  render () {
    const cur = this.props.cur
    const total = this.props.total
    let low = cur < 5 ? 0 : cur - 5
    const upper =  low + 10 > total ? total : low + 10
    low  =  upper - 10 >= 0 ? upper - 10 : low

    const cur_index = cur - low
    const e0 = this.state.expressions.toJS()
    const e1 = e0.slice(low , upper)

    let exprs = e1.map((item, index) => 
      <div key={index} className={index == cur_index ? 'expr-row-cur' : 'expr-row'}>
        <div className='expr-items'>
          <div className='expr-item-str'> {item.expr} </div>
          <div className={this.options_css(0, item.idx, item.inputIdx, index, cur_index)}
            onClick={index == cur_index ? ()=>{this.input(0)} : () => {}}> {item.options[0]} </div>
          <div className={this.options_css(1, item.idx, item.inputIdx, index, cur_index)}
            onClick={index == cur_index ? ()=>{this.input(1)} : () => {}}> {item.options[1]} </div>
          <div className={this.options_css(2, item.idx, item.inputIdx, index, cur_index)}
            onClick={index == cur_index ? ()=>{this.input(2)} : () => {}}> {item.options[2]} </div>
          <div className={this.options_css(3, item.idx, item.inputIdx, index, cur_index)}
            onClick={index == cur_index ? ()=>{this.input(3)} : () => {}}> {item.options[3]} </div>
        </div>
      </div>
    )
    return (
      <HotKeys handlers={this.keyHandlers} style={{outline:'none', height:'100vh'}}>
        <div>
          <div className='expr-options' style={{display:'flex', justifyContent:'space-between'}}>
            <div>
              <span style={{marginRight:'5px'}}>算子最大值</span>
              <Select defaultValue={this.state.max.toString()} onChange={this.onChangeMax}>
                <Option value="5"> 5 </Option>
                <Option value="10"> 10 </Option>
                <Option value="15"> 15 </Option>
                <Option value="20"> 20 </Option>
                <Option value="40"> 40 </Option>
              </Select>
            </div>
            <div>
              <span style={{marginRight:'5px'}}>结果最大值</span>
              <Select defaultValue={this.state.maxResult.toString()} onChange={this.onChangeMaxResult}>
                <Option value="10"> 10 </Option>
                <Option value="20"> 20 </Option>
                <Option value="40"> 40 </Option>
              </Select>
            </div>
            <div>
              <span style={{marginRight:'5px'}}>操作符个数</span>
              <Select defaultValue={this.state.opNum.toString()} onChange={this.onChangeOpNum}>
                <Option value="1"> 1 </Option>
                <Option value="2"> 2 </Option>
                <Option value="3"> 3 </Option>
                <Option value="4"> 4 </Option>
                <Option value="5"> 5 </Option>
              </Select>
            </div>
            <div>
              <span style={{marginRight:'5px'}}>total</span>
              <Select defaultValue={this.props.total.toString()} onChange={this.onChangeTotal}>
                <Option value="10"> 10 </Option>
                <Option value="20"> 20 </Option>
                <Option value="50"> 50 </Option>
                <Option value="100"> 100 </Option>
              </Select>
            </div>
          </div>
          <div className='expr-rows'>
            <div className='expr-row'>
              <div className='expr-items'>
                <div className='expr-item-str expr-item-title'> 算术式 </div>
                <div className='expr-item expr-item-title'> 选项1  </div>
                <div className='expr-item expr-item-title'> 选项2  </div>
                <div className='expr-item expr-item-title'> 选项3  </div>
                <div className='expr-item expr-item-title'> 选项4  </div>
              </div>
            </div>
            {exprs}
          </div>
        </div>
      </HotKeys>
    )
  }
}

export default Expr
