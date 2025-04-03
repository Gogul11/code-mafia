import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const TestCase = ({ value = {}, statusCode = "", message = "" }) => {
    const [outputMessage, setOutputMessage] = useState("Run code to see output");
    
    useEffect(() => {
        // Handle array or string message
        const formattedMessage = Array.isArray(message) 
            ? message[0] || "No output"
            : message || "No output";
            
        setOutputMessage(formattedMessage);
    }, [statusCode, message]);

    // Determine status color
    const getStatusColor = () => {
        if (!statusCode) return "text-gray-500";
        if (statusCode.includes("success")) return "text-green-500";
        if (statusCode.includes("error") || statusCode.includes("wrong")) return "text-red-500";
        return "text-yellow-500";
    };

    return (
        <div className="test-case-container p-4 bg-gray-900 rounded-md font-mono text-sm">
            <div className="input-section mb-4">
                <div className="flex items-center mb-1">
                    <span className="text-purple-400 mr-2">$</span>
                    <span className="text-blue-400">Input:</span>
                </div>
                <pre className="bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                    {value.test_case_input || "No input provided"}
                </pre>
            </div>

            <div className="expected-output-section mb-4">
                <div className="flex items-center mb-1">
                    <span className="text-purple-400 mr-2">$</span>
                    <span className="text-green-400">Expected Output:</span>
                </div>
                <pre className="bg-gray-800 p-2 rounded text-gray-300 overflow-x-auto">
                    {value.test_case_output || "No expected output"}
                </pre>
            </div>

            <div className="output-section">
                <div className="flex items-center mb-1">
                    <span className="text-purple-400 mr-2">$</span>
                    <span className="text-yellow-400">Your Output:</span>
                    {statusCode && (
                        <span className={`ml-2 ${getStatusColor()}`}>
                            [{statusCode}]
                        </span>
                    )}
                </div>
                <pre className={`bg-gray-800 p-2 rounded overflow-x-auto ${getStatusColor()}`}>
                    {outputMessage}
                </pre>
            </div>
        </div>
    );
};

TestCase.propTypes = {
    value: PropTypes.shape({
        test_case_input: PropTypes.string,
        test_case_output: PropTypes.string
    }),
    statusCode: PropTypes.string,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ])
};

TestCase.defaultProps = {
    value: {
        test_case_input: "No input provided",
        test_case_output: "No expected output"
    },
    statusCode: "",
    message: "Run code to see output"
};

export default TestCase;