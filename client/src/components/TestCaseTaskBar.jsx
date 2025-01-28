import { React, useRef } from 'react';
import TestCaseButton from './TestCaseButton.jsx';

function TestCaseTaskBar(props) {
    const testCaseRef = useRef(null);
    props.clickSetter(testCaseRef);
    return (<>
         <TestCaseButton clickRef={testCaseRef} num='1' testCaseSetter={props.tcSetter} testCaseInput={props.testCaseInput} expectedOutput={props.expectedOutput} message={props.message}/>
         <TestCaseButton num='2' testCaseSetter={props.tcSetter} testCaseInput={props.testCaseInput} expectedOutput={props.expectedOutput} message={props.message}/>
         <TestCaseButton num='3' testCaseSetter={props.tcSetter} testCaseInput={props.testCaseInput} expectedOutput={props.expectedOutput} message={props.message}/>
    </>
    );
        
}

export default TestCaseTaskBar;