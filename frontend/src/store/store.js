import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; 
import masterReducer from "./reducers/masterReducer";
import userReducer from "./reducers/userReducer";
import classReducer from "./reducers/classReducer";

const persistConfig = {
  key: "root", 
  storage,
};



const persistedReducer = persistReducer(
  persistConfig, 
  combineReducers({
    showMasterData: masterReducer,
    user: userReducer,
  })
);

const rootReducer = combineReducers({
  persisted: persistedReducer, // Persisted reducers
  classData: classReducer, // Non-persisted reducer
});


const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});


const persistor = persistStore(store);

export { store, persistor };
