import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../../styles/CodeDescriptionPane.css'

function CodeDescriptionPane(props) {
    return (
        <div id="code-description-value">
            <h2 id="code-description-problem-title">{props.problemTitle}</h2>
            <ReactMarkdown id="code-description-problem-description">
                {props.problemDescription}
            </ReactMarkdown>
        </div>
    );
}

export default CodeDescriptionPane;