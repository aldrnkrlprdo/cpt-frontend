"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
// features/auth/authSlice.ts
const toolkit_1 = require("@reduxjs/toolkit");
const initialState = {
    accessToken: undefined,
    userId: undefined,
    fullName: undefined,
    loggedIn: false,
};
const authSlice = (0, toolkit_1.createSlice)({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            return { ...action.payload, loggedIn: true };
        },
        logout: () => initialState,
    },
});
_a = authSlice.actions, exports.login = _a.login, exports.logout = _a.logout;
exports.default = authSlice.reducer;
