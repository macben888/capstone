import React from 'react'
import {selectCurrentOrder, selectOrderToSave} from "../../../../slicer/orderSlice";
import {getTotal} from "../helper";

import {useAppSelector} from "../../../../app/hooks";
//component imports
import OrderItem from "../order-item/OrderItem";
import {
    Button,
    Card,
    CardActions,
    CardHeader,
    Container,
    createTheme,
    Divider,
    ThemeOptions, ThemeProvider,
    Typography
} from "@mui/material";
import CardContent from '@material-ui/core/CardContent';

import Grid from '@material-ui/core/Grid';
import {parseName} from "../../../../interfaces/IThumbnailData";
import {green} from "@mui/material/colors";
import {OrderStatus} from "../../../../interfaces/OrderStatus";
//interface imports

type Props = {
    form?: boolean,
};

function OrderPreview({form}: Props) {
    const orderToSave = useAppSelector(selectOrderToSave)
    const currentOrder = useAppSelector(selectCurrentOrder);
    const order = form ? orderToSave : currentOrder;
    const {orderItems, supplier} = order;
    const productsToOrder = orderItems.map((item, i) => {
        return <OrderItem form={form} key={i} item={item} index={i}/>
    })
    const greenButton = (): ThemeOptions => {
        return createTheme({
            palette: {
                primary: {
                    main: "#388e3c"
                },
            }
        })
    }
    console.log(order.status, order);
    const total = orderItems.reduce(getTotal, 0)
    return (
        <Card sx={{width: 0.99, height: 0.99, display: 'flex', flexDirection: 'column'}}>
            {form && <CardHeader title={`order to ${supplier && parseName(supplier)}`}/>}
            {form && <Divider/>}
            <CardContent>
                <Grid container>
                    {productsToOrder}
                </Grid>
            </CardContent>
            <Container sx={{flexGrow: 1}}/>
            <Divider/>
            <CardActions sx={{display: "flex", justifyContent: "space-between", flexDirection:"row-reverse"}}>
                <Typography >Total:€ {total.toFixed(2)}</Typography>
                <ThemeProvider theme={greenButton()}>
                    {!form && order.status === OrderStatus.PENDING &&  <Button  variant="contained">Receive</Button>}
                </ThemeProvider>
            </CardActions>
        </Card>
    )
}

export default OrderPreview;
