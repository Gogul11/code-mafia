import React, { useState } from "react";
import axios from 'axios';
import Editor from "@monaco-editor/react";

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

    return (
        <div>
            <Editor
                height="400px"
                width="600px"                
                defaultLanguage="python" // or any language you want
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



export default CodeEditor;