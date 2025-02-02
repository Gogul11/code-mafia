import { React, useEffect, useState } from 'react';

function TestCase(props) {

    const [message, setMessage] = useState("");
    useEffect(() => {
        setMessage(props.message[0]);
    }, [props.statusCode, props.message]);

    return (<div>
        <div id="test-case-input-description">
            input = {props.value.test_case_input}
        </div>
        <div id='test-case-output-description'>
            Expected output = {props.value.test_case_output}
        </div>
        <div id='test-case-stdout'> 
            Output: {message}
        </div>
    </div>);
}

export default TestCase;