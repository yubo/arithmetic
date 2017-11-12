import React from 'react'
import PropTypes from 'prop-types'
import { HotKeys } from 'react-hotkeys'
import { fromJS } from 'immutable'
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
        str: '1+1',
        value: 2,
        options: [4,2,5,1], /* up, right, down, left */
        idx: 1,
        input_idx: -1,
      }]),
    }
  }

  static propTypes = {
    level: PropTypes.number.isRequired,
    cur: PropTypes.number.isRequired,
    ok: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    resetCounter: PropTypes.func.isRequired,
    setCounter: PropTypes.func.isRequired,
    doneCounter: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.reset(this.props.level)
  }

  /* [l, u) */
  rand = (u=10, l=0) => {
    return Math.floor(Math.random() * (u-l)) + l
  }

  getNum = () => {
    const  level = (this.props.level - 1) & 3
    console.log()
    switch (level) {
      case 0:
        return this.rand(6, 1)
      case 1:
        return this.rand(11, 1)
      case 2:
        return this.rand(16, 1)
      case 3:
        return this.rand(21, 1)
      default: 
        return this.rand(6, 1)
    }
  }

  getOp = () => {
    return -this.rand(3, 1)
  }

  /* expression generate */
  expr_gen = (l) => {
    if (l == 0) {
      return [this.getNum()]
    }

    if (l == 1) {
      return [this.getOp(), this.getNum(), this.getNum()]
    }

    const n = this.rand(l) 

    return [this.getOp(), ...this.expr_gen(n), ...this.expr_gen(l-n-1)]

  }

  expr_fmt = (e) => {
    const v = e.shift()

    if (v >= 0)
      return {
        str: v.toString(),
        value: v,
      }

    const left = this.expr_fmt(e)
    const right = this.expr_fmt(e)

    switch (v)
    {
      case OP_PLUS:
        return {
          str: '('+ left.str + ' + ' + right.str +')',
          value: left.value + right.value,
        }
      case OP_SUB:
        return {
          str: '('+ left.str + ' - ' + right.str +')',
          value: left.value - right.value,
        }
      case OP_MULT:
        return {
          str: '('+ left.str + ' * ' + right.str +')',
          value: left.value * right.value,
        }
      case OP_DIV:
        return {
          str: '('+ left.str + ' / ' + right.str +')',
          value: left.value / right.value,
        }
      return {str:'', value: 0}
    }
    return '('+left+operation+right+')'
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
    e.input_idx = -1
    return e
  }


  reset = (level) => {
    // check this.state.level and set expression / up / right / down / left
    const total = this.props.total
    const op_number = ((level - 1) >> 2) + 1
    let expressions = []

    this.props.resetCounter(level)

    for (let i = 0; i < total; i++) {
      expressions.push(this.expr_fill_options(this.expr_fmt(this.expr_gen(op_number))))
    }
    this.setState({
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
      expressions: this.state.expressions.setIn([cur, 'input_idx'], idx),
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
      this.reset(this.props.level)
    },
    'stop': () => {
      console.log('stop')
      this.props.doneCounter()
    },
    'level+': () => {
      this.reset(this.props.level + 1)
    },
    'level-': () => {
      const level = this.props.level - 1  > 0 ? this.props.level - 1 : 1;
      this.reset(level)
    }
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

  render () {
    const cur = this.props.cur
    const total = this.props.total
    let low = cur < 5 ? 0 : cur - 5
    const upper =  low + 10 > total ? total : low + 10
    low  =  upper - 10 > 0 ? upper - 10 : low

    const cur_index = cur - low
    const e0 = this.state.expressions.toJS()
    const e1 = e0.slice(low , upper)

    let exprs = e1.map((item, index) => 
      <div key={index} className={index == cur_index ? 'expr-row-cur' : 'expr-row'}>
        <div className='expr-items'>
          <div className='expr-item-str'> {item.str} </div>
          <div className={this.options_css(0, item.idx, item.input_idx, index, cur_index)}> {item.options[0]} </div>
          <div className={this.options_css(1, item.idx, item.input_idx, index, cur_index)}> {item.options[1]} </div>
          <div className={this.options_css(2, item.idx, item.input_idx, index, cur_index)}> {item.options[2]} </div>
          <div className={this.options_css(3, item.idx, item.input_idx, index, cur_index)}> {item.options[3]} </div>
        </div>
      </div>
    )
    return (
      <HotKeys handlers={this.keyHandlers} style={{outline:'none', height:'100vh'}}>
        <div>
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
