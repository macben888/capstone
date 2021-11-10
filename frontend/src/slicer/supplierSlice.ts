import {createAsyncThunk, createSlice, Dispatch, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../app/store';
import { ISuppliersState} from '../interfaces/IStates';
import {IResponseGetAllSuppliers} from "../interfaces/IApiResponse";
import {
    getAll as apiGetAll,
    getOne as apiGetOne,
    create as apiCreate,
    edit as apiEdit,
    del as apiDelete
} from '../services/apiService'
import {ISupplier} from "../interfaces/ISupplier";
import {handleError, invalidDataError} from './helper';


const initialState: ISuppliersState = {
    suppliers: [],
    currentSupplier: undefined,
    supplierToSave: {},
    pending: false,
}
const validateSupplier = (state: RootState) => {
    const supplierKeys = Object.keys(state.supplier.supplierToSave);
    const name = supplierKeys.includes("firstName") || supplierKeys.includes("lastName");
    const contact = supplierKeys.includes("email") || supplierKeys.includes("phone");
    return name && contact;
}

export const getAllSuppliers = createAsyncThunk<IResponseGetAllSuppliers, void, { state: RootState, dispatch: Dispatch }>(
    'getAll/suppliers',
    async (_, {getState, dispatch}) => {
        const token = getState().authentication.token;
        const {data, status, statusText} = await apiGetAll("supplier", token);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const getOneSupplier = createAsyncThunk<IResponseGetAllSuppliers, string, { state: RootState, dispatch: Dispatch }>(
    'getOne/suppliers',
    async (id, {getState, dispatch}) => {
        const token = getState().authentication.token
        const {data, status, statusText} = await apiGetOne("supplier", token, id);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const createSupplier = createAsyncThunk<IResponseGetAllSuppliers, void, { state: RootState, dispatch: Dispatch }>(
    'create/suppliers',
    async (_, {getState, dispatch}) => {
        if (!validateSupplier(getState())) {
//handleError here
            return invalidDataError;
        }
        const token = getState().authentication.token
        const {data, status, statusText} = await apiCreate("supplier", token, getState().supplier.supplierToSave);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const editSupplier = createAsyncThunk<IResponseGetAllSuppliers, ISupplier, { state: RootState, dispatch: Dispatch }>(
    'edit/suppliers',
    async (supplier, {getState, dispatch}) => {
        const token = getState().authentication.token
        const {data, status, statusText} = await apiEdit("supplier", token, supplier);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const deleteSupplier = createAsyncThunk<IResponseGetAllSuppliers, string, { state: RootState, dispatch: Dispatch }>(
    'delete/suppliers',
    async (id, {getState, dispatch}) => {
        const token = getState().authentication.token
        const {data, status, statusText} = await apiDelete("supplier", token, id);
        handleError(status, statusText, dispatch);
        return {data, status, statusText}
    }
)

export const supplierSlice = createSlice({
    name: 'supplier/suppliers',
    initialState,
    reducers: {
        chooseCurrentSupplier: (state:ISuppliersState, action: PayloadAction<string>) => {
            state.currentSupplier = state.suppliers.filter(p => p.id === action.payload)[0];
        },
        handleSupplierFormInput: (state, {payload}: PayloadAction<ISupplier>) => {
            state.supplierToSave = payload;
        },
    },
    extraReducers: (builder => {
        const setPending = (state: ISuppliersState) => {
            state.pending = true;
        }
        const stopPendingAndHandleError = (state: ISuppliersState, action: PayloadAction<IResponseGetAllSuppliers>) => {
            state.pending = false;
            return action.payload.status !== 200;
        }
        builder
            .addCase(getAllSuppliers.pending, setPending)
            .addCase(getOneSupplier.pending, setPending)
            .addCase(createSupplier.pending, setPending)
            .addCase(editSupplier.pending, setPending)
            .addCase(deleteSupplier.pending, setPending)
            .addCase(getAllSuppliers.fulfilled, (state:ISuppliersState, action: PayloadAction<IResponseGetAllSuppliers>) => {
                if (stopPendingAndHandleError(state, action)) return;
                state.suppliers = action.payload.data;
            })
            .addCase(getOneSupplier.fulfilled, (state:ISuppliersState, action: PayloadAction<IResponseGetAllSuppliers>) => {
                stopPendingAndHandleError(state, action);
            })
            .addCase(createSupplier.fulfilled, (state:ISuppliersState, action: PayloadAction<IResponseGetAllSuppliers>) => {
                stopPendingAndHandleError(state, action);
            })
            .addCase(editSupplier.fulfilled, (state:ISuppliersState, action: PayloadAction<IResponseGetAllSuppliers>) => {
                stopPendingAndHandleError(state, action);
            })
            .addCase(deleteSupplier.fulfilled, (state:ISuppliersState, action: PayloadAction<IResponseGetAllSuppliers>) => {
                stopPendingAndHandleError(state, action);
            })
    })
})

export const {chooseCurrentSupplier, handleSupplierFormInput} = supplierSlice.actions;

export const selectSuppliers = (state: RootState) => state.supplier.suppliers;
export const selectCurrentSupplier = (state: RootState) => state.supplier.currentSupplier;
export const selectSupplierToSave = (state: RootState) => state.supplier.supplierToSave;
export const selectPending = (state: RootState) => state.supplier.pending;


export default supplierSlice.reducer;
