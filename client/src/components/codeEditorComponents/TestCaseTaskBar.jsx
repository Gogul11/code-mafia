import React from 'react';
import PropTypes from 'prop-types';

const TestCaseTaskBar = ({ 
  testCaseList = [], 
  message = [], 
  onTestCaseSelect, 
  currentIndex = 0 
}) => {
  // Ensure we have valid arrays
  const safeTestCaseList = Array.isArray(testCaseList) ? testCaseList : [];
  const safeMessages = Array.isArray(message) ? message : [];

  return (
    <div className="test-case-taskbar flex space-x-2 p-2 bg-gray-800 rounded-t-md">
      {safeTestCaseList.map((testCase, index) => (
        <button
          key={`test-case-${index}`}
          className={`px-3 py-1 rounded-md text-sm ${
            currentIndex === index
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => onTestCaseSelect(index)}
        >
          Test Case {index + 1}
          {safeMessages[index] && (
            <span className={`ml-2 text-xs ${
              safeMessages[index].includes('Error') || safeMessages[index].includes('Wrong')
                ? 'text-red-400'
                : safeMessages[index].includes('Success')
                ? 'text-green-400'
                : 'text-yellow-400'
            }`}>
              {safeMessages[index].split('\n')[0].substring(0, 10)}...
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

TestCaseTaskBar.propTypes = {
  testCaseList: PropTypes.array,
  message: PropTypes.array,
  onTestCaseSelect: PropTypes.func.isRequired,
  currentIndex: PropTypes.number
};

TestCaseTaskBar.defaultProps = {
  testCaseList: [],
  message: [],
  currentIndex: 0
};

export default TestCaseTaskBar;