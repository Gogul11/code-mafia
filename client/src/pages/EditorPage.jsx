import React, { useEffect, useState } from 'react';
import CodeEditor from '../components/codeEditorComponents/CodeEditor.jsx';
import CodeDescriptionPane from '../components/codeEditorComponents/CodeDescriptionPane.jsx';
import TestCase from '../components/codeEditorComponents/TestCase.jsx';
import TestCaseTaskBar from '../components/codeEditorComponents/TestCaseTaskBar.jsx';
import Output from '../components/codeEditorComponents/Output.jsx';
import BottomPanel from '../components/codeEditorComponents/BottomPanel.jsx';
import Navbar from '../components/Navbar.jsx';
import '../styles/editorPage.css'
import { BsArrowBarUp } from "react-icons/bs";
import { BsArrowBarDown } from "react-icons/bs";

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
            // try {
            //     setLoading(true);
            //     const response = await fetch(`${process.env.REACT_APP_SERVER_BASEAPI}/problem`);
            //     if (!response.ok) {
            //         throw new Error("Failed to fetch questions");
            //     }
            //     const data = await response.json();

            //     if (!data.qs || !Array.isArray(data.qs) || data.qs.length === 0) {
            //         throw new Error("No questions available.");
            //     }
            //     //setting states
            //     setQuestionSet(data.qs);
            //     setTotalQuestions(data.qs.length);
            //     setCurrentQuestion(1);
            // } catch (err) {
            //     setError(err.message);
            // } finally {
            //     setLoading(false);
            // }
        }
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (questionSet.length > 0) {
            loadQuestion();
        }
    }, [currentQuestion, questionSet]);

    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error}</p>;
    // if (!questionSet) return <p>No questions available.</p>;

    const gotoNextQuestion = () => {
        setCurrentQuestion(prev => Math.min(prev + 1, totalQuestions));
    };

    const gotoPrevQuestion = () => {
        setCurrentQuestion(prev => Math.max(prev - 1, 1));
    };

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const[open, setOpen] = useState(false)

    return (
        // <div id='editor-page-container'>
        //     <Navbar />
        //     <div className='editor-style'>
        //         <div id='description-pane'>
        //             <div id='code-description'>
        //                 {/* <CodeDescriptionPane problemTitle={problemTitle} problemDescription={problemDescription} /> */}
        //                 <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto sed illo quas omnis voluptatibus est. Debitis quae placeat aspernatur sed itaque impedit distinctio velit, amet voluptate, pariatur sequi optio neque!</p>
        //                 <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto sed illo quas omnis voluptatibus est. Debitis quae placeat aspernatur sed itaque impedit distinctio velit, amet voluptate, pariatur sequi optio neque!</p>
        //                 <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto sed illo quas omnis voluptatibus est. Debitis quae placeat aspernatur sed itaque impedit distinctio velit, amet voluptate, pariatur sequi optio neque!</p>
        //                 <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto sed illo quas omnis voluptatibus est. Debitis quae placeat aspernatur sed itaque impedit distinctio velit, amet voluptate, pariatur sequi optio neque!</p>

        //             </div>
        //             <div id='test-case-choose'>
        //             <TestCaseTaskBar
        //                 tcSetter={setTestCaseActive}
        //                 testCaseList={testCaseList} // Pass the testCaseList here
        //                 message={message}
        //                 clickSetter={setClick}
        //             />
        //             </div>
        //             <div id='test-case'>
        //                 <TestCase value={testCaseActive} statusCode={tcStatusCode} message={message} />
        //             </div>
        //             <div id='output-display'>
        //                 <Output tcStatus={tcStatusCode} />
        //             </div>
        //         </div>
        //         <div id='editor-container'>
        //             <CodeEditor testCaseInput={testCaseInput} expectedOutput={expectedOutput} statusSetter={setTcStatusCode} messageSetter={setMessage} click={click} />
        //         </div>
        //     </div>

        //     {/* Add the BottomPanel */}
        //     {/* <BottomPanel
        //         currentQuestion={currentQuestion}
        //         totalQuestions={totalQuestions}
        //         xp={xp}
        //         players={players}
        //         setCurrentQuestion={setCurrentQuestion}
        //         gotoNextQuestion={gotoNextQuestion}
        //         gotoPrevQuestion={gotoPrevQuestion}
        //     /> */}
        // </div>

        <div className='main'>
            {/* <p className='p'>text</p> */}

            <div>
                <Navbar/>
            </div>

            <div className='desc'>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ab dolores aut at similique porro aperiam velit explicabo, eos quisquam quas quis exercitationem earum molestias non voluptas quidem dolor amet quaerat.</p>
                    {/* <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim cum, ut repellendus eaque hic consequuntur reprehenderit esse sapiente natus veritatis accusantium iusto suscipit velit delectus odio dolore illum, debitis officiis.</p> */}
                    {/* <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Unde accusamus fugit minus vero sit ab assumenda dolor quas. Qui quia consequuntur esse porro similique voluptatum nisi quas harum, dignissimos animi!</p> */}
            </div>

            <div id='test-case-choose'>
                    <TestCaseTaskBar
                         tcSetter={setTestCaseActive}
                         testCaseList={testCaseList} // Pass the testCaseList here
                         message={message}
                         clickSetter={setClick}
                     />
            </div>


            <div className='editor'>
                     <CodeEditor testCaseInput={testCaseInput} expectedOutput={expectedOutput} statusSetter={setTcStatusCode} messageSetter={setMessage} click={click} />
            </div>
            <div className='t-c'>
                <div id='test-case'>
                    <TestCase value={testCaseActive} statusCode={tcStatusCode} message={message} />
                </div>
                <div id='output-display'>
                    <Output tcStatus={tcStatusCode} />
                </div>
            </div>

            {windowWidth < 770 ? (
                    <div style={{ position: open ? "fixed": "relative", bottom: open ? "250px" : "5px", left: open ? "10%": "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
                    {open ? (
                        <BsArrowBarDown size={30} onClick={() => setOpen(false)} style={{ cursor: "pointer" }} />
                    ) : (
                        <BsArrowBarUp size={30} onClick={() => setOpen(true)} style={{ cursor: "pointer" }} />
                    )}
                    </div>
                ) : null}

            {windowWidth >= 770 || open ? (
                <BottomPanel
                currentQuestion={currentQuestion}
                totalQuestions={totalQuestions}
                xp={xp}
                players={players}
                setCurrentQuestion={setCurrentQuestion}
                gotoNextQuestion={gotoNextQuestion}
                gotoPrevQuestion={gotoPrevQuestion}
                />
            ) : null}

        </div>
    );
}

export default EditorPage; 