import {createAsyncThunk, createSlice, Dispatch, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../app/store';
import {IProductsState} from '../interfaces/IStates';
import {IResponseGetAllProducts, IResponseGetOneProduct} from "../interfaces/IApiResponse";
import {
    getAll as apiGetAll,
    getOne as apiGetOne,
    create as apiCreate,
    edit as apiEdit,
    del as apiDelete
} from '../services/apiService'
import {emptyProduct, IProduct} from "../interfaces/IProduct";
import {handleError, invalidDataError} from "./errorHelper";
import {hideDetails} from "./detailsSlice";


const initialState: IProductsState = {
    products: [],
    currentProduct: undefined,
    pending: false,
    productToSave: emptyProduct,
}
const route = "products";

export const validateProduct = (product:IProduct):boolean => {
    const necessaryValues = ['name', 'suppliers', 'purchasePrice', 'unitSize']
    //@ts-ignore values defined in line above must be keys of IProduct
    return necessaryValues.every(v => !!product[v])
}

const validateBeforeSendingToBackend = ({product}: RootState) => {
    return validateProduct(product.productToSave);
}


export const getAllProducts = createAsyncThunk<IResponseGetAllProducts, void, { state: RootState, dispatch: Dispatch }>(
    'products/getAll',
    async (_, {getState, dispatch}) => {
        const token = getState().authentication.token;
        const {data, status, statusText} = await apiGetAll(route, token);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const getOneProduct = createAsyncThunk<IResponseGetOneProduct, string, { state: RootState, dispatch: Dispatch }>(
    'products/getOne',
    async (id, {getState, dispatch}) => {
        const token = getState().authentication.token
        const {data, status, statusText} = await apiGetOne(route, token, id);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const createProduct = createAsyncThunk<IResponseGetOneProduct, void, { state: RootState, dispatch: Dispatch }>(
    'products/create',
    async (_, {getState, dispatch}) => {
        if (!validateBeforeSendingToBackend(getState())) {
            return invalidDataError;
        }
        const token = getState().authentication.token
        const {data, status, statusText} = await apiCreate(route, token, getState().product.productToSave);
        handleError(status, statusText, dispatch);
        dispatch(hideDetails());
        return {data, status, statusText}
    }
)

export const editProduct = createAsyncThunk<IResponseGetOneProduct, IProduct, { state: RootState, dispatch: Dispatch }>(
    'products/edit',
    async (product, {getState, dispatch}) => {
        if (!validateBeforeSendingToBackend(getState())) {
            return invalidDataError;
        }
        const token = getState().authentication.token
        const {data, status, statusText} = await apiEdit(route, token, product);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const deleteProduct = createAsyncThunk<IResponseGetOneProduct, string, { state: RootState, dispatch: Dispatch }>(
    'products/delete',
    async (id, {getState, dispatch}) => {
        const token = getState().authentication.token
        const {data, status, statusText} = await apiDelete(route, token, id);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        chooseCurrentProduct: (state, action: PayloadAction<string>) => {
            state.currentProduct = state.products.filter(p => p.id === action.payload)[0];
        },
        handleProductFormInput: (state, {payload}: PayloadAction<IProduct>) => {
            state.productToSave = payload;

        },
    },
    extraReducers: (builder => {
        const setPending = (state: IProductsState) => {
            state.pending = true;
        }
        const stopPendingAndHandleError = (state: IProductsState, action: PayloadAction<IResponseGetAllProducts> | PayloadAction<IResponseGetOneProduct>) => {
            state.pending = false;
            return action.payload.status !== 200;
        }
        builder
            .addCase(getAllProducts.pending, setPending)
            .addCase(getOneProduct.pending, setPending)
            .addCase(createProduct.pending, setPending)
            .addCase(editProduct.pending, setPending)
            .addCase(deleteProduct.pending, setPending)
            .addCase(getAllProducts.fulfilled, (state, action: PayloadAction<IResponseGetAllProducts>) => {
                if (stopPendingAndHandleError(state, action)) return;
                state.products = action.payload.data;
            })
            .addCase(getOneProduct.fulfilled, (state, action: PayloadAction<IResponseGetOneProduct>) => {
                stopPendingAndHandleError(state, action);
            })
            .addCase(createProduct.fulfilled, (state, action: PayloadAction<IResponseGetOneProduct>) => {
                stopPendingAndHandleError(state, action);
            })
            .addCase(editProduct.fulfilled, (state, action: PayloadAction<IResponseGetOneProduct>) => {
                stopPendingAndHandleError(state, action);
            })
            .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<IResponseGetOneProduct>) => {
                stopPendingAndHandleError(state, action);
            })
    })
})

export const {chooseCurrentProduct, handleProductFormInput} = productSlice.actions;

export const selectProducts = (state: RootState) => state.product.products;
export const selectCurrentProduct = (state: RootState) => state.product.currentProduct;
export const selectProductToSave = (state: RootState) => state.product.productToSave;
export const selectPending = (state: RootState) => state.product.pending;


export default productSlice.reducer;
