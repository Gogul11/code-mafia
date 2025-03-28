import React from 'react';

function TestCaseButton(props) {
    function getTestCase(e) {
        const retObj = {
            test_case_input: props.testCaseInput,
            test_case_output: props.expectedOutput,
            stdout: props.message,
        };
        props.testCaseSetter(retObj);
        props.onClick(); // Notify the parent that this button was clicked
    }

    return (
        <button
            ref={props.clickRef}
            onClick={(e) => { getTestCase(e); }}
            className={`test-case-button ${props.isSelected ? 'selected' : ''}`}
            value={props.num - 1}
        >
            TestCase {props.num}
        </button>
    );
}

export default TestCaseButton;