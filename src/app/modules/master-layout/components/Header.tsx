import React from 'react'
import { shallowEqual, useSelector } from 'react-redux'
import { RootState } from '../../../setup/redux/RootReducer'
import { AuthState } from '../../login'

const Header: React.FC = () => {
    const { fullName } = useSelector<RootState>(({ auth }) => auth, shallowEqual) as AuthState

    return (
        <div className="flex w-full h-full sticky shadow-sm">
            <div className="h-20 flex flex-auto items-center mx-10">
                <p className="text-5xl font-bold hover:cursor-pointer">Payment Tracker</p>
            </div>
            <div className="flex-none w-40 flex items-center justify-center">
                <p className='hover:font-bold hover:cursor-pointer'>{fullName} &gt;</p>
            </div>
        </div>
    )
}

export default Header