"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const toolkit_1 = require("@reduxjs/toolkit");
const userSlice = (0, toolkit_1.createSlice)({
    name: 'user',
    initialState: { name: '', loggedIn: false },
    reducers: {
        login: (state, action) => {
            state.name = action.payload;
            state.loggedIn = true;
        },
        logout: (state) => {
            state.name = '';
            state.loggedIn = false;
        },
    },
});
_a = userSlice.actions, exports.login = _a.login, exports.logout = _a.logout;
exports.default = userSlice.reducer;
