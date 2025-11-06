
import { shallowEqual, useSelector } from 'react-redux';
import React from 'react';
import { Navigate, Route, Routes as Switch } from 'react-router-dom'
import MasterLayout from '../../modules/master-layout/MasterLayout';
import { RootState } from '../redux/RootReducer';

const Login = React.lazy(() => import('../../modules/login/components/Login'));
const Main = React.lazy(() => import('../../modules/main/components/Main'));

const Routes: React.FC = () => {
    const isAuthorized = useSelector<RootState>(({ auth }) => auth.loggedIn, shallowEqual)

    return (
        (
            <Switch>
                {
                    !isAuthorized ?
                        ((<Route path='*' element={<Navigate to="/login" replace />} />))
                        :
                        (<Route element={<MasterLayout />}>
                            <Route path="/" element={<Main />} />
                        </Route>)
                }

                <Route path='/login' element={<Login />} />

            </Switch>
        )
    )
}

export { Routes };