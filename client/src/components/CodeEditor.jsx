import React, { useState } from "react";
import axios from 'axios';
import Editor from "@monaco-editor/react";

const CodeEditor = () => {
    const [code, setCode] = useState("console.log('Hello, world!')");

    return (
        <div>
            <Editor
                height="400px"
                width="600px"                
                defaultLanguage="javascript" // or any language you want
                defaultValue={code}
                onChange={(value) => setCode(value)} // Update state on change
                options={{
                    minimap: {
                        enabled: false,
                    },
                }}
            />
            <button onClick={() => handleRunCode(code)}>Run Code</button>
        </div>
    );
};

const handleRunCode = async (code) => {
    console.log("Code to execute:", code);
    const headers = {
        "Content-Type": "application/json",
    };
    const body = {
        "code": code,
        "language": "javascript",
    };
    try {
        console.log(process.env.REACT_APP_SERVER_BASEAPI);
        const response = await axios.post(process.env.REACT_APP_SERVER_BASEAPI + "/codesubmit", body, {headers});
        console.log(response);
    } catch (e) {
        console.log(e);
    }
};

export default CodeEditor;