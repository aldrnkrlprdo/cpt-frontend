import { all } from 'redux-saga/effects';

export function* rootSaga() {
  yield all([
    // fork(authSaga),
    // add more sagas here
  ]);
}
