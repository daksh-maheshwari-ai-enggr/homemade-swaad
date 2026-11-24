import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { RestaurantMenu } from './components/RestaurantMenu';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OtpPage } from './pages/auth/OtpPage';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { logout } from './store/authSlice';

/** Keep signed-in users out of the auth screens. */
function GuestOnly({ children }: { children: ReactElement }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function Header() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-900">
          ☁️ Cloud Kitchen
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Hi, {displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <RegisterPage />
            </GuestOnly>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="container mx-auto px-4 py-8">
        <RestaurantMenu />
      </section>
    </main>
  );
}

export default App;
