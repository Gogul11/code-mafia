import React, { useState } from "react";
import axios from 'axios';
import Editor from "@monaco-editor/react";
import '../../styles/editor.css'
import { BsClipboard2Fill } from "react-icons/bs";
import { BsClipboard2CheckFill } from "react-icons/bs";
import { BsArrowClockwise } from "react-icons/bs";

// Language configurations with Judge0 IDs and boilerplate code
const LANGUAGE_CONFIG = {
  python: {
    id: 71,
    name: "Python",
    boilerplate: "#your code here",
    monacoLang: "python"
  },
  cpp: {
    id: 54,
    name: "C++",
    boilerplate: `#include <iostream>\nusing namespace std;\n\nint main() {\n    //Your code here\n    return 0;\n}`,
    monacoLang: "cpp"
  },
  c: {
    id: 50,
    name: "C",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    //Your code here\n    return 0;\n}`,
    monacoLang: "c"
  },
  java: {
    id: 62,
    name: "Java",
    boilerplate: `public class Main {\n    public static void main(String[] args) {\n        //Your code here\n    }\n}`,
    monacoLang: "java"
  },
  javascript: {
    id: 63,
    name: "JavaScript",
    boilerplate: "//Your code here",
    monacoLang: "javascript"
  }
};

const CodeEditor = ({ questionId, onSubmissionComplete }) => {
  const [lang, setLang] = useState('python');
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(`userCode_${questionId}`);
    return savedCode || LANGUAGE_CONFIG[lang].boilerplate;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('vs-dark');

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => setCopied(true))

    setTimeout(() => setCopied(false), 2000)

  }

  const handleReset = () => {
    const response = window.confirm("This will erase the code you typed. Do you want to proceed?");
    if (response) {
      setCode("print('Hello, world!')");
    }
  }

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASEAPI}/editor/batch`,
        {
          question_id: questionId,
          language_id: LANGUAGE_CONFIG[lang].id,
          source_code: code
        }
      );

      onSubmissionComplete(response.data);
    } catch (error) {
      console.error("Submission error:", error);
      onSubmissionComplete({
        error: "Failed to submit code"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    const response = window.confirm("Changing language will reset your code. Continue?");
    if (response) {
      setLang(newLang);
      const boilerplate = LANGUAGE_CONFIG[newLang].boilerplate;
      setCode(boilerplate);
      localStorage.setItem(`userCode_${questionId}`, boilerplate);
    }
  };

  return (
    <div>
      <div id='top-div'>

        <select id="lang" value={lang} onChange={(e) => handleLanguageChange(e.target.value)}>
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
          {copied ? <BsClipboard2CheckFill className="copy" size={30} color="green" /> : <BsClipboard2Fill className="copy" onClick={handleCopy} size={30} />}

          <BsArrowClockwise className='reset' size={30} onClick={handleReset} />
        </div>

      </div>
      {copied && <p id='success'>Code Copied to Clipboard</p>}

      <div id='editor'>

        <Editor
          value={code}
          onChange={(value) => {
            setCode(value);
            localStorage.setItem(`userCode_${questionId}`, value);
          }
          }
          language={LANGUAGE_CONFIG[lang].monacoLang}
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
        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="run-button"
          id='run-button'
        >Run Code</button>
      </div>
    </div>
  );
};

export default CodeEditor;