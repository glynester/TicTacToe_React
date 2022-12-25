import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props){
    return (
      <button className={`square ${props.winningSquare}`}
      onClick={()=>props.onSquareClick()}>
        {props.value}
      </button>
    );
}

class Board extends React.Component {
  isWinningSquare=(i)=>{
    return this.props.winningLine.includes(i)?'winningSquares':'';
  }

  renderSquare(i) {
    return (
      <Square value={this.props.squares[i]} winningSquare={this.isWinningSquare(i)}
        onSquareClick={()=>this.props.onBrdClick(i)}
      />
    );
  }
  
  render() {
    let cnt = 0
    return (
      <div>
        <div className="status"></div>
        {[...Array(3)].map(_=>{
          return <div className="board-row">
            {[...Array(3)].map(_=>this.renderSquare(cnt++))}
          </div>
        })}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state={
      history:[{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      rowColHistory:[['','']],
      winningSquares: [],
    };
  }

  componentDidUpdate(){
    const history = this.state.history.slice(0, this.state.stepNumber+1);
    const current = history[history.length-1];
    const squares = current.squares.slice();
    const winningMoves=calculateWinner(squares);
    if (winningMoves && !this.state.winningSquares.length){
      this.setState({winningSquares:winningMoves})
    }
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber+1);
    const current = history[history.length-1];
    const squares = current.squares.slice();

    const winningMoves=calculateWinner(squares);
    if (winningMoves || squares[i]){
      return;
    }
    squares[i]=this.state.xIsNext?'X':'O';
    this.setState({
      history:history.concat([{
        squares,
      }]),
      stepNumber: history.length,
      xIsNext:!this.state.xIsNext,
      rowColHistory: this.rcHistory(i),
    })
  }

  rcHistory=i=>this.state.rowColHistory.concat([[Math.floor(i/3)+1,(i%3)+1]]);

  getCurrentRC=i=>this.state.rowColHistory[i];

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step%2)===0,
      winningSquares:[]
    });
  }

  btnDescr=(de,mv)=>de.includes('start')?'':
    `(R${this.getCurrentRC(mv)[0]}, C${this.getCurrentRC(mv)[1]})`;

  setClass=(i)=>{
    if(this.state.stepNumber==i){
      return 'highlight'
    } 
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    let winningMoves= calculateWinner(current.squares);
    const moves = history.map((step,move)=>{
    const desc = move? `Go to move #${move}`:"Go to game start";
      return (
        <li key={move}>
          <button className={this.setClass(move)} onClick={()=>this.jumpTo(move)}>{`${desc} ${this.btnDescr(desc,move)}`}</button>   
        </li>
      );
    })

    let status, final='';
    if (!winningMoves && current.squares.filter(v=>v!==null).length===9){
      status = 'This game was a draw!'
      final='finalResult';
    } else if (winningMoves){
      status = `The winner is ${current.squares[winningMoves[0]]}`;
      final='finalResult';
    } else {
      status = `Next player: ${this.state.xIsNext?'X':'O'}`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onBrdClick={i=>this.handleClick(i)}
            winningLine = {this.state.winningSquares}
          />
        </div>
        <div className="game-info">
          <div className={final}>{status}</div>
          <ol id = 'moveList'>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]){
      return lines[i];
    }
  }
  return null;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
