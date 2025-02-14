import React, { useEffect, useState } from 'react';
import CodeEditor from '../components/codeEditorComponents/CodeEditor.jsx';
import CodeDescriptionPane from '../components/codeEditorComponents/CodeDescriptionPane.jsx';
import TestCase from '../components/codeEditorComponents/TestCase.jsx';
import TestCaseTaskBar from '../components/codeEditorComponents/TestCaseTaskBar.jsx';
import Output from '../components/codeEditorComponents/Output.jsx';
import BottomPanel from '../components/codeEditorComponents/BottomPanel.jsx';
import Navbar from '../components/Navbar.jsx';

const EditorPage = () => {
    const testCaseInput = ['hi', 'hello', 'bye'];
    const expectedOutput = ['hi', 'hello', 'bye'];

    const [testCaseActive, setTestCaseActive] = useState({
        test_case_input: "",
        test_case_output: "",
        stdout: "",
    });
    const [testCaseList, setTestCaseList] = useState([]);
    const [testCaseIndex, setTestCaseIndex] = useState(1);
    const [tcStatusCode, setTcStatusCode] = useState(["", "", ""]);
    const [message, setMessage] = useState(["Run first!", "Run first!", "Run first!"]);
    const [click, setClick] = useState(null);
    const [problemTitle, setProblemTitle] = useState("");
    const [problemDescription, setProblemDescription] = useState("");

    const [questionSet, setQuestionSet] = useState([]);

    // State for currentQuestion, totalQuestions, and xp
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [xp, setXp] = useState(50);
    const [players, setPlayers] = useState([
        { icon: '👤' },
        { icon: '👤' },
        { icon: '👤' },
    ]);

    // error and loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadQuestion = async() => {
        const question = questionSet[currentQuestion - 1];
        if (!question) {
            return;
        }
        setProblemTitle(currentQuestion + ". " + question.title);
        setProblemDescription(question.description);
        setTestCaseList(parseTestCaseList(Object.values(question.test_cases)));
        setTestCaseIndex(1);
    };

    const parseTestCaseList = (testCases) => {
        const testCaseList = Object.values(testCases).map(testCase => {
            return {
                input: JSON.stringify(testCase.input), // Convert input to string
                expected_output: JSON.stringify(testCase.expected_output) // Convert expected_output to string
            };
        });
    
        return testCaseList;
    };

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_SERVER_BASEAPI}/problem`);
                if (!response.ok) {
                    throw new Error("Failed to fetch questions");
                }
                const data = await response.json();

                if (!data.qs || !Array.isArray(data.qs) || data.qs.length === 0) {
                    throw new Error("No questions available.");
                }
                //setting states
                setQuestionSet(data.qs);
                setTotalQuestions(data.qs.length);
                setCurrentQuestion(1);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questionSet.length > 0) {
            loadQuestion();
        }
    }, [currentQuestion, questionSet]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!questionSet) return <p>No questions available.</p>;

    const gotoNextQuestion = () => {
        setCurrentQuestion(prev => Math.min(prev + 1, totalQuestions));
    };

    const gotoPrevQuestion = () => {
        setCurrentQuestion(prev => Math.max(prev - 1, 1));
    };

    return (
        <div id='editor-page-container'>
            <Navbar />
            <div id='description-pane'>
                <div id='code-description'>
                    <CodeDescriptionPane problemTitle={problemTitle} problemDescription={problemDescription} />
                </div>
                <div id='test-case-choose'>
                <TestCaseTaskBar
                    tcSetter={setTestCaseActive}
                    testCaseList={testCaseList} // Pass the testCaseList here
                    message={message}
                    clickSetter={setClick}
                />
                </div>
                <div id='test-case'>
                    <TestCase value={testCaseActive} statusCode={tcStatusCode} message={message} />
                </div>
                <div id='output-display'>
                    <Output tcStatus={tcStatusCode} />
                </div>
            </div>
            <div id='editor-container'>
                <CodeEditor testCaseInput={testCaseInput} expectedOutput={expectedOutput} statusSetter={setTcStatusCode} messageSetter={setMessage} click={click} />
            </div>

            {/* Add the BottomPanel */}
            <BottomPanel
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestions}
                xp={xp}
                players={players}
                setCurrentQuestion={setCurrentQuestion}
                gotoNextQuestion={gotoNextQuestion}
                gotoPrevQuestion={gotoPrevQuestion}
            />
        </div>
    );
}

export default EditorPage;