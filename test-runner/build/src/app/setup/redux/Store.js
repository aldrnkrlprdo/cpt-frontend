"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistor = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const redux_saga_1 = __importDefault(require("redux-saga"));
const redux_batch_1 = require("@manaflair/redux-batch");
const redux_persist_1 = require("redux-persist");
const RootReducer_1 = require("./RootReducer");
const RootSaga_1 = require("./RootSaga");
const tokenMiddleware_1 = require("../../core/middleware/tokenMiddleware");
const sagaMiddleware = (0, redux_saga_1.default)();
const store = (0, toolkit_1.configureStore)({
    reducer: RootReducer_1.rootReducer,
    middleware: (getDefaultMiddleware) => new toolkit_1.Tuple(...getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
        thunk: true,
    }), sagaMiddleware, tokenMiddleware_1.tokenMiddleware),
    enhancers: (getDefaultEnhancers) => new toolkit_1.Tuple(...getDefaultEnhancers(), redux_batch_1.reduxBatch),
    devTools: process.env.NODE_ENV !== 'production',
});
exports.persistor = (0, redux_persist_1.persistStore)(store);
sagaMiddleware.run(RootSaga_1.rootSaga);
exports.default = store;
