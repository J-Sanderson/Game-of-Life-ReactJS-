var Controls = React.createClass({
  displayName: "Controls",


  render: function render() {
    return React.createElement(
      "div",
      { id: "controls" },
      React.createElement(
        "h1",
        null,
        "Conway's Game of Life"
      ),
      React.createElement(
        "p",
        null,
        "Written with ReactJS and HTML Canvas for ",
        React.createElement(
          "a",
          { href: "https://www.freecodecamp.org" },
          "freeCodeCamp"
        ),
        "."
      ),
      React.createElement(
        "p",
        null,
        "Try clicking the board to add and remove cells!"
      ),
      React.createElement(
        "h2",
        null,
        "Generation: ",
        this.props.generation
      ),
      React.createElement(
        "button",
        { id: "start-btn", onClick: this.start },
        "Play"
      ),
      React.createElement(
        "button",
        { id: "pause-btn", onClick: this.pause },
        "Pause"
      ),
      React.createElement(
        "button",
        { id: "clear-btn", onClick: this.clear },
        "Clear"
      ),
      React.createElement(
        "h3",
        null,
        "Board size:"
      ),
      React.createElement(
        "button",
        { id: "smallSize", onClick: this.changeSize },
        "Small"
      ),
      React.createElement(
        "button",
        { id: "mediumSize", onClick: this.changeSize },
        "Medium"
      ),
      React.createElement(
        "button",
        { id: "largeSize", onClick: this.changeSize },
        "Large"
      ),
      React.createElement(
        "h3",
        null,
        "Game speed:"
      ),
      React.createElement(
        "button",
        { id: "slow-btn", onClick: this.changeSpeed },
        "Slow"
      ),
      React.createElement(
        "button",
        { id: "med-btn", onClick: this.changeSpeed },
        "Medium"
      ),
      React.createElement(
        "button",
        { id: "fast-btn", onClick: this.changeSpeed },
        "Fast"
      )
    );
  },

  start: function start() {
    this.props.startGame();
  },

  pause: function pause() {
    this.props.pauseGame();
  },

  clear: function clear() {
    this.props.clearBoard();
  },

  changeSize: function changeSize(e) {
    e.preventDefault();
    this.props.boardSetup(e.target.id);
  },

  changeSpeed: function changeSpeed(e) {
    e.preventDefault();
    this.props.changeGameSpeed(e.target.id);
  }

});

var Grid = React.createClass({
  displayName: "Grid",


  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      var canvas = ReactDOM.findDOMNode(this.refs.gridCanvas);

      switch (this.props.size) {
        case "largeSize":
          canvas.width = 700;
          canvas.height = 700;
          break;
        case "mediumSize":
          canvas.width = 450;
          canvas.height = 450;
          break;
        case "smallSize":
          canvas.width = 300;
          canvas.height = 300;
          break;
      }

      var ctx = canvas.getContext("2d");

      //iterate through the rows
      for (var i = 0; i < this.props.board.length; i++) {
        //through individual row
        for (var j = 0; j < this.props.board.length; j++) {
          ctx.beginPath();
          ctx.strokeStyle = '#0D0015';
          ctx.fillStyle = this.props.board[i][j] ? '#0D0015' : '#D8CBE0';
          ctx.lineWidth = 0.1;
          ctx.rect(i * 10, j * 10, 10, 10);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  },

  render: function render() {
    return React.createElement(
      "div",
      { id: "grid" },
      React.createElement("canvas", { id: "gridCanvas", ref: "gridCanvas", onClick: this.clickCell })
    );
  },

  clickCell: function clickCell(e) {
    e.preventDefault();

    //get click co-ordinates (may need Firefox implementation)
    var canvas = ReactDOM.findDOMNode(this.refs.gridCanvas);
    var x = e.pageX - canvas.offsetLeft;
    var y = e.pageY - canvas.offsetTop;

    //divide by ten and round down = corresponding array location
    this.props.addCell(Math.floor(y / 10), Math.floor(x / 10));
  }

});

var App = React.createClass({
  displayName: "App",


  getInitialState: function getInitialState() {
    //set up initial medium sized board
    var board = [];
    for (var i = 0; i < 45; i++) {
      board.push([]);
    }
    return {
      board: board,
      generation: 0,
      size: 'mediumSize',
      speed: 500
    };
  }, //getInitialState

  componentDidMount: function componentDidMount() {
    //initialise board and start playing
    this.boardSetup();
    this.startGame();
  }, //componentDidMount

  render: function render() {
    return React.createElement(
      "div",
      { id: "main" },
      React.createElement(Controls, {
        generation: this.state.generation,
        play: this.play,
        boardSetup: this.boardSetup,
        changeGameSpeed: this.changeGameSpeed,
        pauseGame: this.pauseGame,
        startGame: this.startGame,
        clearBoard: this.clearBoard
      }),
      React.createElement(Grid, {
        size: this.state.size,
        board: this.state.board,
        addCell: this.addCell
      })
    );
  }, //render

  boardSetup: function boardSetup(size) {
    if (size) {
      this.setState({ size: size });
    } else {
      var size = "mediumSize";
    }
    //array depends on size of board
    //each cell is 10 pixels
    var numRows;
    switch (size) {
      case "smallSize":
        numRows = 30;
        break;
      case "mediumSize":
        numRows = 45;
        break;
      case "largeSize":
        numRows = 70;
        break;
      default:
        numRows = 45;
    }
    //create board with needed rows
    var tempBoard = [];
    for (var i = 0; i < numRows; i++) {
      tempBoard.push([]);
    }
    //set up random start positions
    //iterate over each row
    for (var i = 0; i < numRows; i++) {
      //through each row
      for (var j = 0; j < numRows; j++) {
        //randomly determine if cell is dead or alive
        //true=alive, false=dead
        //25% change of alive
        var aliveOrDead = Math.random() > 0.75 ? true : false;
        tempBoard[i].push(aliveOrDead);
      }
    }
    this.setState({ generation: 0, board: tempBoard });
  }, //boardSetup

  play: function play() {
    //game logic

    //create a new board to write to
    var tempBoard = this.state.board.map(function (arr) {
      return arr.slice();
    });

    //create a second board to reference (but not write to)
    var refBoard = tempBoard.map(function (arr) {
      return arr.slice();
    });

    var lastIndex = refBoard.length - 1;

    //iterate through the temp board
    for (var i = 0; i < tempBoard.length; i++) {
      //row
      for (var j = 0; j < tempBoard.length; j++) {
        //column

        var neighbours = [];

        //top left
        if (i === 0 && j === 0) {
          //cell at top left of board
          neighbours[0] = refBoard[lastIndex][lastIndex];
        } else if (i === 0) {
          //cell at top but not left
          neighbours[0] = refBoard[lastIndex][j - 1];
        } else if (j === 0) {
          //cell at left but not top
          neighbours[0] = refBoard[i - 1][lastIndex];
        } else {
          //cell not at top or left
          neighbours[0] = refBoard[i - 1][j - 1];
        }

        //top centre
        if (i === 0) {
          //cell on top row
          neighbours[1] = refBoard[lastIndex][j];
        } else {
          neighbours[1] = refBoard[i - 1][j];
        }

        //top right
        if (i === 0 && j === lastIndex) {
          //cell at top right
          neighbours[2] = refBoard[lastIndex][0];
        } else if (i === 0) {
          //cell at top but not right
          neighbours[2] = refBoard[lastIndex][j + 1];
        } else if (j === lastIndex) {
          //cell at right but not top
          neighbours[2] = refBoard[i - 1][0];
        } else {
          //cell not at top or right
          neighbours[2] = refBoard[i - 1][j + 1];
        }

        //left
        if (j === 0) {
          //cell at left
          neighbours[3] = refBoard[i][lastIndex];
        } else {
          //cell not at left
          neighbours[3] = refBoard[i][j - 1];
        }

        //right
        if (j === lastIndex) {
          neighbours[4] = refBoard[i][0];
        } else {
          neighbours[4] = refBoard[i][j + 1];
        }

        //bottom left
        if (i === lastIndex && j === 0) {
          //cell on bottom left
          neighbours[5] = refBoard[0][lastIndex];
        } else if (i === lastIndex) {
          //cell on bottom
          neighbours[5] = refBoard[0][j - 1];
        } else if (j === 0) {
          //cell on left
          neighbours[5] = refBoard[i + 1][lastIndex];
        } else {
          //cell not on bottom or left
          neighbours[5] = refBoard[i + 1][j - 1];
        }

        //bottom centre
        if (i === lastIndex) {
          //cell on bottom
          neighbours[6] = refBoard[0][j];
        } else {
          neighbours[6] = refBoard[i + 1][j];
        }

        //bottom right
        if (i === lastIndex && j === lastIndex) {
          //cell on bottom right
          neighbours[7] = refBoard[0][0];
        } else if (j === lastIndex) {
          //cell on right
          neighbours[7] = refBoard[i + 1][0];
        } else if (i === lastIndex) {
          //cell on bottom
          neighbours[7] = refBoard[0][j + 1];
        } else {
          neighbours[7] = refBoard[i + 1][j + 1];
        }

        var neighbourCount = 0;
        neighbours.forEach(function (count) {
          if (count) {
            neighbourCount++;
          };
        });

        //game logic for live cells
        if (refBoard[i][j]) {
          //die
          if (neighbourCount < 2 || neighbourCount > 3) {
            tempBoard[i][j] = false;
          }
        } else {
          //come to life
          if (neighbourCount === 3) {
            tempBoard[i][j] = true;
          }
        }
      }
    }

    this.setState({ board: tempBoard, generation: this.state.generation + 1 });
  }, //play

  changeGameSpeed: function changeGameSpeed(speedBtn) {
    //set speed depending on clicked button
    var speed;
    switch (speedBtn) {
      case "slow-btn":
        speed = 1000;
        break;
      case "med-btn":
        speed = 500;
        break;
      case "fast-btn":
        speed = 100;
        break;
    }
    this.setState({ speed: speed });
    //stop current interval
    clearInterval(this.intervalID);
    //restart with the new speed
    this.intervalID = setInterval(this.play, speed);
  }, //changeGameSpeed

  startGame: function startGame() {
    this.intervalID = setInterval(this.play, this.state.speed);
  }, //startGame

  pauseGame: function pauseGame() {
    clearInterval(this.intervalID);
  }, //pauseGame

  clearBoard: function clearBoard() {
    clearInterval(this.intervalID);
    var tempBoard = this.state.board.map(function (arr) {
      return arr.map(function (cell) {
        return cell = false;
      });
    });
    this.setState({ generation: 0, board: tempBoard });
  }, //clearBoard

  addCell: function addCell(col, row) {
    //create a new board to write to
    var tempBoard = this.state.board.map(function (arr) {
      return arr.slice();
    });
    //turn on or off
    if (tempBoard[row][col]) {
      tempBoard[row][col] = false;
    } else {
      tempBoard[row][col] = true;
    }
    //state
    this.setState({ board: tempBoard });
  } //addCell

});

ReactDOM.render(React.createElement(App, null), document.getElementById("root"));