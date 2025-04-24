import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/CodeDescriptionPane.css'

function CodeDescriptionPane(props) {
    return (
        <div id="code-description-value">
            <h2 id="code-description-problem-title">
                {props.problemTitle} <h3 id="problem-difficulty">({props.problemDifficulty})</h3>
            </h2>
            <ReactMarkdown id="code-description-problem-description">
                {props.problemDescription}
            </ReactMarkdown>
        </div>
    );
}

export default CodeDescriptionPane;