import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../modules/login/redux/loginReducer';
import masterRecordReducer from '../../modules/master-record/redux/masterRecordSlice';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['accessToken', 'userId', 'fullName', 'loggedIn'], // only persist these fields
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  masterRecord: masterRecordReducer,
  // other reducers...
});

export type RootState = ReturnType<typeof rootReducer>;
export { rootReducer };


