import { React, useState, useEffect } from 'react';

function Temp() {
    const [name, setName] = useState("");
    useEffect(() => {
        setName(prompt("Please enter your name: ", "Anonymous User"));
    }, []);
    return (
        <div id='temp'>
            <div id='temp-input'>
                <input type='text' placeholder='send message'></input>
                <button>Send</button>
            </div>
            <div id='temp-list'>
                <p>messages: </p>
                <ul>

                </ul>
            </div>
        </div>
    );
}

export default Temp;