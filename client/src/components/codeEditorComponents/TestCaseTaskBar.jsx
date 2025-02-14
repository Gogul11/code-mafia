import React, { useRef, useState } from 'react';
import TestCaseButton from './TestCaseButton.jsx';

function TestCaseTaskBar(props) {
    const testCaseRef = useRef(null);
    const [selectedButton, setSelectedButton] = useState(0); // Track the selected button index

    // Trigger a click on the first button when the component mounts
    React.useEffect(() => {
        if (testCaseRef.current) {
            testCaseRef.current.click();
        }
    }, []);

    return (
        <>
            {props.testCaseList.map((testCase, index) => (
                <TestCaseButton
                    key={index}
                    clickRef={index === 0 ? testCaseRef : null}
                    num={index + 1}
                    testCaseSetter={props.tcSetter}
                    testCaseInput={testCase.input}
                    expectedOutput={testCase.expected_output}
                    message={props.message[index]}
                    isSelected={selectedButton === index}
                    onClick={() => setSelectedButton(index)} // Update the selected button
                />
            ))}
        </>
    );
}

export default TestCaseTaskBar;