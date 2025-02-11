import React, { useState } from 'react';
import CodeEditor from '../components/codeEditorComponents/CodeEditor.jsx';
import CodeDescriptionPane from '../components/codeEditorComponents/CodeDescriptionPane.jsx';
import TestCase from '../components/codeEditorComponents/TestCase.jsx';
import TestCaseTaskBar from '../components/codeEditorComponents/TestCaseTaskBar.jsx';
import Output from '../components/codeEditorComponents/Output.jsx';
import BottomPanel from '../components/codeEditorComponents/BottomPanel.jsx'; // Import the new component

const EditorPage = () => {
    const testCaseInput = ['hi', 'hello', 'bye'];
    const expectedOutput = ['hi', 'hello', 'bye'];

    const [testCaseValue, setTestCase] = useState({
        test_case_input: "hi",
        test_case_output: "hello",
        stdout: "Run first!",
    });
    const [tcStatusCode, setTcStatusCode] = useState(["", "", ""]);
    const [message, setMessage] = useState(["Run first!", "Run first!", "Run first!"]);
    const [click, setClick] = useState(null);

    // Example data for the BottomPanel
    const currentQuestion = 1;
    const totalQuestions = 10;
    const xp = 50;
    const players = [
        { icon: '👤' },
        { icon: '👤' },
        { icon: '👤' },
    ];

    return (
        <div id='editor-page-container'>
            <div id='description-pane'>
                <div id='code-description'>
                    <CodeDescriptionPane />
                </div>
                <div id='test-case-choose'>
                    <TestCaseTaskBar  tcSetter={setTestCase} testCaseInput={testCaseInput} expectedOutput={expectedOutput}  message={message} clickSetter={setClick}/>
                </div>
                <div id='test-case'>
                    <TestCase value={testCaseValue} statusCode={tcStatusCode} message={message}/>
                </div>
                <div id='output-display'>
                    <Output tcStatus={tcStatusCode}/>
                </div>
            </div>
            <div id='editor-container'>
                <CodeEditor testCaseInput={testCaseInput} expectedOutput={expectedOutput} statusSetter={setTcStatusCode} messageSetter={setMessage} click={click}/>
            </div>

            {/* Add the BottomPanel */}
            <BottomPanel
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestions}
                xp={xp}
                players={players}
            />
        </div>
    );
}

export default EditorPage;