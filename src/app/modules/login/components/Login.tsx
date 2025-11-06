import { useState } from "react"
import { useDispatch } from "react-redux";
import * as auth from '../redux/loginReducer';
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const usernameOnChange = (e: any) => {
        setUsername(e.target.value);
    }

    const passwordOnChange = (e: any) => {
        setPassword(e.target.value);
    }

    const loginOnClick = () => {
        const payload: auth.AuthState = {
            loggedIn: true,
            userId: "1",
            fullName: "System Admin",
            accessToken: "JWT Token Sample"
        }
        if (username.length > 0 && password.length > 0) {
            dispatch(auth.login(payload))
            navigate('/')
        }
    }

    return (
        <>
            <div>
                <label>Username: </label>
                <input type="text" placeholder="Username" value={username} onChange={(e: any) => usernameOnChange(e)} />
            </div>
            <div>
                <label>Password: </label>
                <input type="text" placeholder="Password" value={password} onChange={(e: any) => passwordOnChange(e)} />
            </div>
            <button onClick={() => loginOnClick()}>Log In</button>
        </>
    )
}

export default Login;