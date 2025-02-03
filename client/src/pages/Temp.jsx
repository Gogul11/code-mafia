import { React, useState, useEffect } from 'react';
import socket from '../socket.js';

function Temp() {
    const [usernameAlreadySelected, setUsernameAlreadySelected] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [usersAvailable, setUsersAvailable] = useState([]);
    function onNextClick() {
        onUsernameSelection(inputValue);
    }
    function onUsernameSelection(username) {
        setUsernameAlreadySelected(true);
        socket.auth = { username };
        socket.connect();
    }
    useEffect(() => {
        socket.on("connect_error", (err) => {
            if (err.message === "invalid username") {
              setUsernameAlreadySelected(false);
            }
          });
          socket.on("users", (users) => {
            users.forEach((user) => {
              user.isCurrentUser = user.userID === socket.id;
            });
            // put the current user first, and then sort by username
            users = users.sort((a, b) => {
              return a.username > b.username ? 1 : 0;
            });
            setUsersAvailable([...users]);
          });
          socket.on("user connected", (user) => {
            setUsersAvailable(usersAvailable => [...usersAvailable, user]);
          });
          return () => {
              socket.off("connect_error");
              socket.off("users");
            }
        }, []);
        useEffect(() => {
            console.log("usersAvailabe: ", usersAvailable);
        }, [usersAvailable]);
    return (
        <div id='temp'>
            {!usernameAlreadySelected && <div id='username-input'>
                <input  type='text' placeholder='enter username' value={inputValue} onChange={(e) => {setInputValue(e.target.value);}}></input>
                <button onClick={onNextClick}>Next</button>
            </div>}
            {usernameAlreadySelected && <><div id='temp-input'>
                <input type='text' placeholder='send message'></input>
                <button>Send</button>
            </div>
            <div id='temp-list'>
                <p>messages: </p>
                <ul>

                </ul>
            </div></>}
            {usersAvailable.length > 0 && 
            <ul>
                {usersAvailable.map((user) => <li>{user.username}</li>)}
            </ul>}
        </div>
    );
}

export default Temp;