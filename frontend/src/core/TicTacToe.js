import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useStateWithCallbackLazy } from "use-state-with-callback";
import Room from "./Room";

//Connecting socket with backend
const sock = io("http://localhost:8000");

const TicTacToe = () => {
  const [values, setValues] = useStateWithCallbackLazy({
    click: "X",
    cells: Array(9).fill(""),
    winner: null,
    Draw: null,
    text: "",
  });

  const Restart = () => {
    setValues({
      click: "X",
      cells: Array(9).fill(""),
      winner: null,
      Draw: null,
      text: "",
    });
  };

  const Draw = (squares) => {
    // console.log(square.includes(undefined));

    if (squares.includes("") === false) {
      setValues({ ...values, Draw: true });
    }
  };

  const Win = (square) => {
    // setting winning combos
    let combos = {
      horizontal: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ],
      vertical: [
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
      ],
      diagonal: [
        [0, 4, 8],
        [2, 4, 6],
      ],
    };

    // looping each combo every click to see if there is a combo
    // remember this function is called every click

    for (let combo in combos) {
      combos[combo].forEach((element) => {
        //console.log(square[element[0]]);
        if (
          square[element[0]] === "" ||
          square[element[1]] === "" ||
          square[element[2]] === ""
        ) {
          // If there is not a combo -> do nothing
        } else if (
          square[element[0]] === square[element[1]] &&
          square[element[1]] === square[element[2]]
        ) {
          // If there is a winning combo -> setting a winner
          setValues({ ...values, winner: square[element[0]] });
        }
      });
    }
  };

  const Click = (num, e) => {
    // num -> number of the square clicked

    e.preventDefault();

    // if the square was already clicked send an alert
    if (values.cells[num] !== "" || undefined) {
      // console.log(values.cells[num]);
      alert("Already was clicked");
      return;
    }

    let square = [...values.cells];

    // storing very click in an array
    square[num] = values.click;

    setValues({
      ...values,
      click: values.click === "X" ? "O" : "X",
      cells: square,
    });

    sock.emit("click", square);
  };
  useEffect(() => {
    console.log("entered useEffect Win and Draw", values.cells);
    // Looking for a draw or a win every time values.cells changes
    Win(values.cells);
    Draw(values.cells);
  }, [values.cells]);

  const Cell = ({ num }) => {
    return (
      <>
        <td
          onClick={(e) => {
            Click(num, e);
          }}
        >
          {values.cells[num]}
        </td>
      </>
    );
  };

  useEffect(() => {
    sock.on("connect", () => {
      console.log("Connected to the server");
      sock.emit("hello", "Hi from frontend");
      console.log("tic", sock);
    });
  });

  useEffect(() => {
    sock.on("message", (msg) => {
      setValues({ ...values, text: msg });
    });
    sock.on("click", (square) => {
      // console.log(square);
      setValues({
        ...values,
        click: values.click === "X" ? "O" : "X",
        cells: square,
      });
    });
  });

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col">
            Turn: {values.click}
            <table>
              <tbody>
                {/* <th>TicTacToe</th> */}
                <tr>
                  <Cell num={0} />
                  <Cell num={1} />
                  <Cell num={2} />
                </tr>
                <tr>
                  <Cell num={3} />
                  <Cell num={4} />
                  <Cell num={5} />
                </tr>
                <tr>
                  <Cell num={6} />
                  <Cell num={7} />
                  <Cell num={8} />
                </tr>
              </tbody>
            </table>
            <p>{values.text}</p>
          </div>
          <div className="col">
            <Room socket={sock} />
          </div>
        </div>
        <div className="row">
          <div>
            {values.winner && (
              <div>
                <p> "{values.winner}" You Won!</p>
                <button onClick={Restart} className="btn btn-success">
                  Restart
                </button>
              </div>
            )}
            {values.Draw && (
              <div>
                <p> Draw! </p>
                <button onClick={Restart}>Restart</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TicTacToe;
