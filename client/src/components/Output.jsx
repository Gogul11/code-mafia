import React from 'react';
import OutputStatus from './OutputStatus';

function Output(props) {
    return (
        <div id='output-container'>
            <OutputStatus num="1" tcStatus={props.tcStatus[0]}/>
            <OutputStatus num="2" tcStatus={props.tcStatus[1]}/>
            <OutputStatus num="3" tcStatus={props.tcStatus[2]}/>
        </div>
    );
}

export default Output;