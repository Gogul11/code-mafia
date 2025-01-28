import {React, useEffect, useState} from 'react';

function OutputStatus(props) {
    const [isActive, setIsActive] = useState(false);
    useEffect(() => {

        if (props.tcStatus === "Accepted") setIsActive(true);
        else setIsActive(false);
    }, [props.tcStatus]);

    const idValue = "output-status-" + props.num;
    return (
        <div style={{ backgroundColor: isActive ? 'green' : 'red'}} id={idValue} className='output-status'>{isActive ? "Nice" : "Ooof"}</div>
    );
}

export default OutputStatus;