import React, { useEffect, useState, useRef } from 'react';
import CodeEditor from '../components/codeEditorComponents/CodeEditor.jsx';
import CodeDescriptionPane from '../components/codeEditorComponents/CodeDescriptionPane.jsx';
import BottomPanel from '../components/codeEditorComponents/BottomPanel.jsx';
import Navbar from '../components/Navbar.jsx';
import '../styles/editorPage.css'
import { BsArrowBarUp } from "react-icons/bs";
import { BsArrowBarDown } from "react-icons/bs";
import PowerupsDialog from '../components/PowerupsDialog.jsx';
import axios from "axios";
import PowerUpContainer from '../components/powerUpComponents/PowerUpContainer.jsx';
import TestCases from '../components/codeEditorComponents/TestCases.jsx';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const EditorPage = () => {

    const [testCaseList, setTestCaseList] = useState([]);
    const [problemTitle, setProblemTitle] = useState("");
    const [problemDifficulty, setProblemDifficulty] = useState("");
    const [problemDescription, setProblemDescription] = useState("");

    const [questionSet, setQuestionSet] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [xp, setXp] = useState(0);

    const [powerupsDialogOpen, setPowerupsDialogOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const {
        powers,
        teams,
        username,
        inputValue,
        clickedPower,
        clickedTeam,
        popup,
        popupCount,
        coins,
        getCoins,
        setClickedPower,
        setClickedTeam,
        handlePopupClose,
        handleApply,
        popupRef,
        overlayRef
    } = PowerUpContainer();

    const submitRef = useRef();

    const loadQuestion = async () => {
        const question = questionSet[currentQuestion - 1];
        if (!question) return;

        setProblemTitle(`${currentQuestion}. ${question.title}`);
        setProblemDifficulty(question.difficulty);
        setProblemDescription(question.description);


        const testCasesArray = Object.entries(question.test_cases).map(([key, value]) => ({
            id: key,
            input: value.input,
            expected_output: value.expected_output
        }));

        setTestCaseList(testCasesArray);
    };


    const getSubmissionStatus = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/problem/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            const statusMap = response.data;
    
            // Update the questionSet with status and code information
            setQuestionSet(prevQuestions =>
                prevQuestions.map(question => ({
                    ...question,
                    status: statusMap[question.id]?.status || 'unattempted',
                    code: statusMap[question.id]?.code || ''
                }))
            );
        } catch (error) {
            console.error('Error fetching submission status:', error);
            // If the request fails, set all questions to 'unattempted' and code to ''
            setQuestionSet(prevQuestions =>
                prevQuestions.map(question => ({
                    ...question,
                    status: 'unattempted',
                    code: ''
                }))
            );
        }
    };

    const getXP = async () => {
        axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/editor/points`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(response => {
            if (response.data && response.data.points !== undefined) {
                setXp(response.data.points);
            }
        }).catch(err => {
            console.error("Failed to fetch points:", err);
        });
    }


    const onSubmissionComplete = (results) => {
        if (results.error) {
            return;
        }

        getXP();
        getCoins();


        setTestCaseList(results.results.map(result => ({
            name: result.testCase,
            input: result.input,
            expected_output: result.expectedOutput,
            output: result.output,
            status: result.status
        })));
    }

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_SERVER_BASEAPI}/auth/verify`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!response.data.valid) {
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
        getXP();
        getCoins();
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
        getSubmissionStatus();
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
                <div>
                    <Navbar />
                </div>

                <div>
                    <div className="content" style={{ height: '100vh' }}>
                        <PanelGroup autoSaveId="codePanelLayout" direction='horizontal'>
                            <Panel defaultSize={50}>
                                {/* Left Pane */}
                                <div className="left-pane" style={{ paddingRight: '10px', height: '100%' }}>
                                    <div className="desc">
                                        <CodeDescriptionPane
                                            problemTitle={problemTitle}
                                            problemDescription={problemDescription}
                                            problemDifficulty={problemDifficulty}
                                        />
                                    </div>

                                    <div id="test-case-choose">
                                        <TestCases testCases={testCaseList} />
                                    </div>
                                </div>
                            </ Panel>
                            <PanelResizeHandle className="panelresizer" />
                            <Panel defaultSize={50}>
                                {/* Right Pane */}
                                <div className="right-pane" style={{ height: '100%' }}>
                                    <div className="editor">
                                        <CodeEditor
                                            questionId={questionSet[currentQuestion - 1].id}
                                            onSubmissionComplete={(results) => onSubmissionComplete(results)}
                                            submitRef={submitRef}
                                            codeFromDB={questionSet[currentQuestion - 1].code}
                                        />
                                    </div>
                                </div>
                            </Panel>
                        </PanelGroup>
                    </div>

                </div>
                <div>
                    {windowWidth < 770 ? (
                        <div
                            style={{
                                position: "fixed",
                                bottom: open ? "20px" : "20px",
                                left: "10%",
                                transform: "translateX(-50%)",
                                zIndex: 1000,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                pointerEvents: "none",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#FFD400",
                                    borderRadius: "50%",
                                    padding: "8px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                    pointerEvents: "auto",
                                    cursor: "pointer",
                                }}
                                onClick={() => setOpen(!open)}
                            >
                                {open ? (
                                    <BsArrowBarDown size={24} color="#030617" />
                                ) : (
                                    <BsArrowBarUp size={24} color="#030617" />
                                )}
                            </div>
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
                            questions={questionSet}
                            submitRef={submitRef}
                        />
                    ) : null}


                    {powerupsDialogOpen &&
                        <PowerupsDialog
                            onClose={() => setPowerupsDialogOpen(false)}
                            powers={powers}
                            teams={teams}
                            onPowerSelect={setClickedPower}
                            onTeamSelect={setClickedTeam}
                            onUsePower={handleApply}
                            coins={coins} />
                    }
                </div>

            </div>
        </>
    );
}

export default EditorPage;


