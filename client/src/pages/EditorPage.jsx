import React, { useEffect, useState, useRef } from 'react';
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
import PowerupsDialog from '../components/PowerupsDialog.jsx';
import axios from "axios";
import socket from "../socket.js";
import PowerUpContainer from '../components/powerUpComponents/PowerUpContainer.jsx';

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

    //powerups dialog
    const [powerupsDialogOpen, setPowerupsDialogOpen] = useState(false);

    // error and loading
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //power ups related___________________________________________________________________________________________________
    const {
        powers,
        teams,
        username,
        inputValue,
        clickedPower,
        clickedTeam,
        popup,
        popupCount,
        setClickedPower,
        setClickedTeam,
        handlePopupClose,
        handleApply,
        popupRef,
        overlayRef
    } = PowerUpContainer();

    //_______________________________________________________________________________________________________

    const loadQuestion = async () => {
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
        const verifyToken = async () => {
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (!response.data.valid){
                window.location.href = "/login"
              }
            } catch (error) {
              console.error('Token verification failed');
              window.location.href = "/login"
            }
          } else {
            window.location.href = "/login";
          }
        };
        verifyToken();
      }, []);

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

    const [open, setOpen] = useState(false)

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!questionSet) return <p>No questions available.</p>;
    return (
        <>
            <div id="overlay" ref={overlayRef}></div>

            <div className='main'>
                {/* <p className='p'>text</p> */}

                <div>
                    <Navbar />
                </div>

                <div>
                    <div className='desc'>
                        <CodeDescriptionPane problemTitle={problemTitle} problemDescription={problemDescription} />
                    </div>
                    <div className='editor'>
                        <CodeEditor testCaseInput={testCaseInput} expectedOutput={expectedOutput} statusSetter={setTcStatusCode} messageSetter={setMessage} click={click} />
                    </div>
                </div>
                <div>
                    <div id='test-case-choose'>
                        <TestCaseTaskBar
                            tcSetter={setTestCaseActive}
                            testCaseList={testCaseList} // Pass the testCaseList here
                            message={message}
                            clickSetter={setClick}
                        />
                    </div>
                    <div className='t-c'>
                        <div id='test-case'>
                            <TestCase value={testCaseActive} statusCode={tcStatusCode} message={message} />
                        </div>
                    </div>
                    <div id='output-display'>
                        <Output tcStatus={tcStatusCode} />
                    </div>
                    {windowWidth < 770 ? (
                        <div style={{ position: open ? "fixed" : "relative", bottom: open ? "250px" : "5px", left: open ? "10%" : "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
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
                            setCurrentQuestion={setCurrentQuestion}
                            gotoNextQuestion={gotoNextQuestion}
                            gotoPrevQuestion={gotoPrevQuestion}
                            powerupsDialogOpen={powerupsDialogOpen}
                            setPowerupsDialogOpen={setPowerupsDialogOpen}
                        />
                    ) : null}
                    {/* Powerups Dialog Component */}
                    {powerupsDialogOpen &&
                        <PowerupsDialog
                            onClose={() => setPowerupsDialogOpen(false)}
                            powers={powers}
                            teams={teams}
                            onPowerSelect={setClickedPower}
                            onTeamSelect={setClickedTeam}
                            usePower={handleApply} />
                    }
                </div>

            </div>
        </>
    );
}

export default EditorPage;

//() => setPowerupsDialogOpen(false)