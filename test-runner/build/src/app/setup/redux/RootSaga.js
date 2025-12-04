"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootSaga = rootSaga;
const effects_1 = require("redux-saga/effects");
function* rootSaga() {
    yield (0, effects_1.all)([
    // fork(authSaga),
    // add more sagas here
    ]);
}
