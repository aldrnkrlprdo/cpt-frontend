"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootReducer = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const loginReducer_1 = __importDefault(require("../../modules/login/redux/loginReducer"));
const redux_persist_1 = require("redux-persist");
const storage_1 = __importDefault(require("redux-persist/lib/storage")); // defaults to localStorage
const authPersistConfig = {
    key: 'auth',
    storage: storage_1.default,
    whitelist: ['accessToken', 'userId', 'fullName', 'loggedIn'], // only persist these fields
};
const rootReducer = (0, toolkit_1.combineReducers)({
    auth: (0, redux_persist_1.persistReducer)(authPersistConfig, loginReducer_1.default),
    // other reducers...
});
exports.rootReducer = rootReducer;
