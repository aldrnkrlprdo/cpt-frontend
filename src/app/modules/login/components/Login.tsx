import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import * as auth from '../redux/loginReducer';
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getTokenPayload } from "../../../core/utils/tokenUtils";

const LOGIN_URL = `${process.env.REACT_APP_BASE_API_URL}auth/login`; // Example URL, replace with your actual login endpoint

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!username.trim() || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);
    const controller = new AbortController();

    try {
      const resp = await axios.post(
        LOGIN_URL,
        { username: username.trim(), password }
      );

      const data = resp?.data ?? {};

      // normalize token / user shapes
      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data?.accessToken;

      if (!token) {
        const message = data?.message || "Authentication failed: token not returned";
        throw new Error(message);
      }

      const user = getTokenPayload(token);

      if (!user) {
        const message = "Authentication failed: could not decode user data from token";
        throw new Error(message);
      }

      // persist token (used by api service interceptors)
      localStorage.setItem("token", token);

      const payload: auth.AuthState = {
        loggedIn: true,
        userId: (user?.id ?? user?.userId ?? "1").toString(),
        fullName: (user?.fullName ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`).trim() || username,
        accessToken: token,
        role: user?.role // Make sure role is stored in auth state
      };

      dispatch(auth.login(payload));
      toast.success("Logged in");
      navigate("/", { replace: true });
    } catch (err: any) {
      if (axios.isCancel(err)) {
        // request cancelled — ignore
        return;
      }
      const message = err?.response?.data?.message || err?.message || "Login failed";
      toast.error(message);
      console.error("Login error:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
      controller.abort();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-nbs-gray">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-nbs-red rounded-lg mx-auto flex items-center justify-center mb-3">
            <span className="text-white font-display font-bold text-2xl">NB</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-nbs-text">Sign in</h2>
          <p className="text-gray-600 text-sm">Cooperative Payment Tracker</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" aria-labelledby="login-form">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="nbs-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="nbs-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="nbs-button w-full flex items-center justify-center gap-2"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Don't have an account? </span>
          <Link to="/register" className="text-nbs-red font-semibold hover:underline ml-1">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;