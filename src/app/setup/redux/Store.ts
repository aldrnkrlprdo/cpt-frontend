import { configureStore, Tuple } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { reduxBatch } from '@manaflair/redux-batch';
import { persistStore } from 'redux-persist';
import { rootReducer } from './RootReducer';
import { rootSaga } from './RootSaga';
import { tokenMiddleware } from '../../core/middleware/tokenMiddleware';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    new Tuple(
      ...getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
        thunk: true,
      }),
      sagaMiddleware,
      tokenMiddleware
    ),
  enhancers: (getDefaultEnhancers) =>
    new Tuple(
      ...getDefaultEnhancers(),
      reduxBatch
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
sagaMiddleware.run(rootSaga);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
