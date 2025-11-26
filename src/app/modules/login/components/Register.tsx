import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const REGISTER_URL = `${process.env.REACT_APP_BASE_API_URL}auth/register`;

const Register: React.FC = () => {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [role, setRole] = useState<string>("user"); // added
    const [status, setStatus] = useState<string>("active"); // added
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const handleRegister = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!username.trim() || !password || password !== confirmPassword) {
            toast.error("Please fill required fields and ensure passwords match");
            return;
        }

        setLoading(true);
        const controller = new AbortController();

        try {
            const resp = await axios.post(
                REGISTER_URL,
                {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    username: username.trim(),
                    email: email.trim(),
                    password,
                    role,    // included
                    status   // included
                },
                {
                    signal: controller.signal,
                    headers: { "Content-Type": "application/json" }
                }
            );

            if (resp.status === 200) {
                toast.success("Registration successful. Please sign in.");
                navigate("/login", { replace: true });
            }
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Registration failed";
            toast.error(message);
            console.error("Register error:", err);
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
                    <h2 className="text-2xl font-display font-bold text-nbs-text">Create account</h2>
                    <p className="text-gray-600 text-sm">Cooperative Payment Tracker</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input className="nbs-input" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                        <input className="nbs-input" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                    </div>

                    <div>
                        <input className="nbs-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>

                    <div>
                        <input type="email" className="nbs-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div>
                        <input type="password" className="nbs-input" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <div>
                        <input type="password" className="nbs-input" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>

                    {/* Role and Status fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select className="nbs-input" value={role} onChange={e => setRole(e.target.value)} aria-label="Role">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select className="nbs-input" value={status} onChange={e => setStatus(e.target.value)} aria-label="Status">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={() => navigate("/login")} className="px-4 py-2 border rounded-md hover:bg-gray-100" disabled={loading}>
                            Back to Sign in
                        </button>
                        <button type="submit" className="nbs-button" disabled={loading}>
                            {loading ? "Creating..." : "Create account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;