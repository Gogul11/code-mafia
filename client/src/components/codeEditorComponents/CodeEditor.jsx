import React, { useState, useEffect } from "react";
import axios from 'axios';
import Editor from "@monaco-editor/react";
import '../../styles/editor.css'
import { BsClipboard2Fill, BsClipboard2CheckFill, BsArrowClockwise } from "react-icons/bs";

// Language configurations with Judge0 IDs and boilerplate code
const LANGUAGE_CONFIG = {
  python: {
    id: 71,
    name: "Python",
    boilerplate: "# Your code here",
    monacoLang: "python"
  },
  cpp: {
    id: 54,
    name: "C++",
    boilerplate: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
    monacoLang: "cpp"
  },
  c: {
    id: 50,
    name: "C",
    boilerplate: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
    monacoLang: "c"
  },
  java: {
    id: 62,
    name: "Java",
    boilerplate: `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
    monacoLang: "java"
  },
  javascript: {
    id: 63,
    name: "JavaScript",
    boilerplate: "// Your code here",
    monacoLang: "javascript"
  }
};

const CodeEditor = ({ questionId, onSubmissionComplete }) => {
  // Load last used language or default to Python
  const savedLang = localStorage.getItem("lastSelectedLang") || "python";
  const [lang, setLang] = useState(savedLang);
  const [code, setCode] = useState(() => {
    return localStorage.getItem(`userCode_${questionId}_${savedLang}`) || LANGUAGE_CONFIG[savedLang].boilerplate;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState('vs-dark');

  useEffect(() => {
    localStorage.setItem("lastSelectedLang", lang);
  }, [lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
      .then(() => setCopied(true));

    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    const response = window.confirm("This will erase the code you typed. Do you want to proceed?");
    if (response) {
      setCode(LANGUAGE_CONFIG[lang].boilerplate);
      localStorage.setItem(`userCode_${questionId}_${lang}`, LANGUAGE_CONFIG[lang].boilerplate);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_BASEAPI}/editor/batch`,
        {
          question_id: questionId,
          language_id: LANGUAGE_CONFIG[lang].id,
          source_code: code
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
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
      localStorage.setItem("lastSelectedLang", newLang);
      setLang(newLang);

      // Load saved code for the new language or set to boilerplate
      const savedCode = localStorage.getItem(`userCode_${questionId}_${newLang}`);
      setCode(savedCode || LANGUAGE_CONFIG[newLang].boilerplate);
    }
  };

  return (
    <div>
      <div id='top-div'>

        {/* Language Selection */}
        <select id="lang" value={lang} onChange={(e) => handleLanguageChange(e.target.value)}>
          <option value=''>Select Language</option>
          {Object.keys(LANGUAGE_CONFIG).map((key) => (
            <option key={key} value={key}>{LANGUAGE_CONFIG[key].name}</option>
          ))}
        </select>

        {/* Theme Selection */}
        <select id='lang' value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value=''>Select Theme</option>
          <option value='light'>Light Theme</option>
          <option value='vs-dark'>VS Code Dark Theme</option>
          <option value='hc-black'>Dark Theme</option>
        </select>

        {/* Copy and Reset Buttons */}
        <div className="but">
          {copied ? <BsClipboard2CheckFill className="copy" size={30} color="green" /> :
            <BsClipboard2Fill className="copy" onClick={handleCopy} size={30} />}

          <BsArrowClockwise className='reset' size={30} onClick={handleReset} />
        </div>

      </div>

      {copied && <p id='success'>Code Copied to Clipboard</p>}

      {/* Code Editor */}
      <div id='editor'>
        <Editor
          value={code}
          onChange={(value) => {
            setCode(value);
            localStorage.setItem(`userCode_${questionId}_${lang}`, value);
          }}
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
            readOnly: false,
            contextmenu: false,
          }}
          theme={theme}
          onMount={(editor) => {
            editor.onDidPaste(() => {
              console.log("Paste action blocked");
              editor.trigger('keyboard', 'undo', null); // Revert the paste
            });
          }}
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