import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../core/services/token.service';
import { parseTokenPayload } from '../../core/utils/tokenUtils';
import { reauthenticate, AuthState } from '../../modules/login/redux/loginReducer';
import { RootState } from '../redux/RootReducer';

const AuthInit = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const isAuthorized = useSelector<RootState, boolean>(({ auth }) => auth.loggedIn);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  // We use a ref to prevent a double-run of the logic in StrictMode.
  const didInit = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (didInit.current) return;
      didInit.current = true;

      try {
        const token = getToken();
        if (token) {
          const payload = parseTokenPayload(token);
          if (payload) {
            const authState: AuthState = {
              accessToken: token,
              userId: payload.id || payload.userId,
              fullName: payload.fullName || `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
              loggedIn: true,
              role: payload.role,
            };
            dispatch(reauthenticate(authState));
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Optionally handle token validation errors here, e.g., by logging out.
      } finally {
        setShowSplashScreen(false);
      }
    };

    if (!isAuthorized) {
      initAuth();
    } else {
      setShowSplashScreen(false);
    }
  }, [dispatch, isAuthorized]);

  return showSplashScreen ? <div>Loading...</div> : <>{children}</>;
};

export default AuthInit;