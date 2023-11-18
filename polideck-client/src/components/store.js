import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  transactionSuccess: null,
};

const transactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_TRANSACTION_SUCCESS":
      return {
        ...state,
        transactionSuccess: action.payload,
      };
    case "RESET_TRANSACTION_STATUS":
      return {
        ...state,
        transactionSuccess: initialState.transaction
      }
    default:
      return state;
  }
};

export const store = configureStore({
  reducer: {
    transaction: transactionReducer,
  },
});
