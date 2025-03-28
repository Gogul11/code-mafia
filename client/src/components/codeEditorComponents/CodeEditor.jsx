import React, { useEffect, useState } from "react";
import axios from 'axios';
import Editor from "@monaco-editor/react";
import '../../styles/editor.css'
import { BsClipboard2Fill } from "react-icons/bs";
import { BsClipboard2CheckFill } from "react-icons/bs";
import { BsArrowClockwise } from "react-icons/bs";

const CodeEditor = (props) => {
    const [code, setCode] = useState("print('Hello, world!')");
    const handleRunCode = async (code) => {
        props.click.current?.click();
        const headers = {
            "Content-Type": "application/json",
        };
        const queryBody = [];

        for (let i = 0; i < 3; i++) {
            queryBody.push({
                "source_code": code,
                "language_id": 71,
                "stdin":props.testCaseInput[i],
                "expected_output":props.expectedOutput[i],
            });
        }
        try {
            const response = await axios.post(process.env.REACT_APP_SERVER_BASEAPI + "/editor/batch", {"submissions": queryBody}, {headers});
            console.log("response received!");

            props.statusSetter(
                [response.data.output.submissions[0].status.description, 
                response.data.output.submissions[1].status.description, 
                response.data.output.submissions[2].status.description]
            );

            props.messageSetter(
                [response.data.output.submissions[0].stdout || response.data.output.submissions[0].stderr, 
                response.data.output.submissions[1].stdout || response.data.output.submissions[1].stderr, 
                response.data.output.submissions[2].stdout || response.data.output.submissions[2].stderr]
            );

        } catch (e) {
            console.log(e);
        }
    };

    const[copied, setCopied] = useState(false)
    const[lang, setLang] = useState('python')
    const[theme, setTheme] = useState('light')
    const[reset, setReset] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        .then(() => setCopied(true))

        setTimeout(() => setCopied(false), 2000)

    }

    const handleReset = () => {
        const response = window.confirm("This will erase the code you typed. Do you want to proceed?");
        if (response) {
            setReset(true)
            setCode("print('Hello, world!')");
            setTimeout(() => setReset(false), 2000)
        }
    }
    

    useEffect(() => {
        const savedCode = localStorage.getItem('userCode')
        setCode(savedCode)
    }, [])

    const handleCodeChange = (val) => {
        setCode(val)
        localStorage.setItem('userCode', val)
    }

    return (
        <div>
            <div id='top-div'>

                    <select id="lang" value={lang} onChange={(e) => setLang(e.target.value)}>
                        <option id="lang-option" value=''>Select Language</option>
                        <option id="lang-option" value='python'>Python</option>
                        <option id="lang-option" value='cpp'>C++</option>
                        <option id="lang-option" value='c'>C</option>
                        <option id="lang-option" value='java'>Java</option>
                        <option id="lang-option" value='javascript'>Java script</option>
                    </select>

                    <select id='lang' value={theme} onChange={(e) => setTheme(e.target.value)}>
                        <option id="lang-option" value=''>Select Theme</option>
                        <option id="lang-option" value='light'>Light Theme</option>
                        <option id="lang-option" value='vs-dark'>VS code Dark Theme</option>
                        <option id="lang-option" value='hc-black'>Dark Theme</option>
                    </select>

                    <div className="but">
                        {copied ? <BsClipboard2CheckFill className="copy" size={30} color="green"/> : <BsClipboard2Fill className="copy" onClick={handleCopy} size={30} /> }
                        
                        <BsArrowClockwise className='reset'size={30} onClick={handleReset}/>
                    </div>

            </div>
                    {copied && <p id='success'>Code Copied to Clipboard</p>}

            <div id='editor'>

                <Editor
                    className="editor-container"
                    height="95%"
                    width="95%"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        padding: { top: 10, bottom: 10 },
                        lineNumbers: "on",
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                    }}
                    theme={theme}
                />

            </div>

            <div className="run">
                <button onClick={() => handleRunCode(code)} 
                    id='run-button'
                >Run Code</button>
            </div>
        </div>
    );
};




export default CodeEditor;

//1B262C dark1
//0F4C75 dark2
//3282B8 dark3
//BBE1FA dark4
