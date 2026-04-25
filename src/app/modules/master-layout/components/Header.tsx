import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../setup/redux/RootReducer";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProfileModal from "../../profile/components/ProfileModal";
import { UserCircleIcon } from "../../../shared/components/icons";
const Header: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false); // added
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authState = useSelector((s: RootState) => s.auth);
  const isAuthorized = Boolean(authState?.loggedIn);
  const fullName = authState?.fullName || "";
  
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("persist:auth");
    dispatch({ type: "auth/logout" });
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="h-16 bg-nbs-red text-white flex items-center px-4 shadow-sm">
        <div className="flex items-center gap-4 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center text-nbs-red font-bold">
              IGP
            </div>
            <div className="text-lg font-semibold">ACE ABCC</div>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md"
                title={isAuthorized ? fullName || "Profile" : "Menu"}
              >
                {isAuthorized ? (
                  <>
                    <UserCircleIcon className="w-8 h-8" />
                    <span className="hidden sm:inline">{fullName}</span>
                  </>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
                  <div className="px-3 py-2 border-b text-sm text-gray-600">{isAuthorized ? fullName : "Welcome"}</div>

                  <ul className="flex flex-col">
                    {isAuthorized ? (
                      <>
                        <li>
                          <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2 hover:bg-gray-100">Home</Link>
                        </li>
                        <li>
                          <button onClick={() => { setOpen(false); setProfileOpen(true); }} className="w-full text-left px-3 py-2 hover:bg-gray-100">Profile</button>
                        </li>
                        <li>
                          <button onClick={handleLogout} className="w-full text-left px-3 py-2 hover:bg-gray-100">Logout</button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 hover:bg-gray-100">Sign in</Link>
                        </li>
                        <li>
                          <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2 hover:bg-gray-100">Register</Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default Header;