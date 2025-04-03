import React, { useState } from "react";
import "../../styles/TestCases.css";

const TestCases = ({ testCases }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="test-case-container">
      {/* Test Case List */}
      <div className="test-case-list">
        {testCases.map((testCase, index) => (
          <button
            key={index}
            className={`test-case-btn ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            Test Case {index + 1}
          </button>
        ))}
      </div>

    {/* Test Case Details */}
    <div className="test-case-details">
        <h3>Test Case Input</h3>
        <pre className={`test-case-input ${testCases[activeIndex]?.isPrefilled ? "prefilled" : "loaded"}`}>
            {testCases[activeIndex]?.input !== undefined ? String(testCases[activeIndex]?.input) : "N/A"}
        </pre>

        <h3>Expected Output</h3>
        <pre className={`test-case-output ${testCases[activeIndex]?.isPrefilled ? "prefilled" : "loaded"}`}>
            {testCases[activeIndex]?.expected_output !== undefined ? String(testCases[activeIndex]?.expected_output) : "N/A"}
        </pre>
    </div>

    {/* Test Case Output */}
      <div className="test-case-output">
        <h3>Output</h3>
        <pre className={`test-case-result ${testCases[activeIndex]?.status ? "loaded" : "prefilled"}`}>
          {testCases[activeIndex]?.output || "Run the code to see output"}
        </pre>

        <p className={`status ${testCases[activeIndex]?.status?.toLowerCase() || ""}`}>
          {testCases[activeIndex]?.status || ""}
        </p>
      </div>
    </div>
  );
};

export default TestCases;
