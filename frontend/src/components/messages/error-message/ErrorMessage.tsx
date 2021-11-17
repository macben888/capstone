import React from 'react'
import {useAppDispatch} from "../../../app/hooks";
import {hideDetails} from "../../../slicer/detailsSlice";

//component imports
import {Button, Typography} from "@mui/material";

//interface imports

type Props = {
    statusText?: string,
};

function ErrorMessage({statusText}: Props) {
    const dispatch = useAppDispatch();
    return (
        <div style={{maxWidth: 400}}>
            <Typography variant="h3" component="h3" gutterBottom align='center'>  {statusText}</Typography>
            <Button color={"error"} fullWidth variant="contained" onClick={() => dispatch(hideDetails())}>Close</Button>
        </div>
    )
}

export default ErrorMessage;
