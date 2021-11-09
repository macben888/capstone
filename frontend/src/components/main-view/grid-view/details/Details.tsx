import React from 'react'
import {useAppDispatch, useAppSelector} from "../../../../app/hooks";
import {hideDetails, resetDetails, selectShowDetails} from "../../../../slicer/detailsSlice";

//component imports
import {Dialog, DialogContent, DialogProps, useMediaQuery, useTheme} from "@mui/material";
import DetailsCard from "./details-card/DetailsCard";
import { Button } from '@mui/material';

//interface imports

type Props = {};


function Details(props: Props) {
    const [scroll] = React.useState<DialogProps['scroll']>('paper');
    const dispatch = useAppDispatch();
    const showDetails = useAppSelector(selectShowDetails);
    const descriptionElementRef = React.useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    React.useEffect(() => {
        if (showDetails) {
            const {current: descriptionElement} = descriptionElementRef;
            if (descriptionElement !== null) {
                descriptionElement.focus();
            }
        }
    }, [showDetails]);
    const handleClose = () => {
        dispatch(resetDetails());
        dispatch(hideDetails());
    }

    return (
        <Dialog fullScreen={fullScreen} open={showDetails} onClose={handleClose}>
            <DialogContent dividers={scroll === 'paper'}>
                <div ref={descriptionElementRef}>
                    <DetailsCard fullScreen={fullScreen} handleClose={handleClose}/>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default Details;
