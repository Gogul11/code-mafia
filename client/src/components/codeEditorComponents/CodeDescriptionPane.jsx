import React from 'react';

function CodeDescriptionPane(props) {
    return (
        <div id="code-description-value">
            <h2 id="code-description-problem-title">{props.problemTitle}</h2>
            <p id="code-description-problem-description">{props.problemDescription}</p>
        </div>
    );
}

export default CodeDescriptionPane;