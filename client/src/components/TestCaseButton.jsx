import React from 'react';

function TestCaseButton(props) {

    function getTestCase(e) {
        const retObj = {
            test_case_input: props.testCaseInput[parseInt(e.target.value)],
            test_case_output: props.expectedOutput[parseInt(e.target.value)],
            stdout: props.message[parseInt(e.target.value)],
        };
        props.testCaseSetter(retObj);
    }
    return (<button ref={props.clickRef} onClick={(e) => {getTestCase(e);}} className='test-case-button' value={props.num - 1}>TestCase {props.num}</button>);
}

export default TestCaseButton;