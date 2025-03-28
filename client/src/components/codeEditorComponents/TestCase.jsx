import { React, useEffect, useState } from 'react';

function TestCase(props) {

    const [message, setMessage] = useState("");
    useEffect(() => {
        setMessage(props.message[0]);
    }, [props.statusCode, props.message]);

    return (<div>
        <div id="test-case-input-description">
            <span className='terminal-text'>$input :</span> {props.value.test_case_input}
        </div>
        <div id='test-case-output-description'>
            <span className='terminal-text'>$Expected output :</span> {props.value.test_case_output}
        </div>
        <div id='test-case-stdout'>
            <span className='terminal-text'>$Output:</span> {message}
        </div>
    </div>);
}

export default TestCase;