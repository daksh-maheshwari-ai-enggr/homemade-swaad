import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantMenu } from './components/RestaurantMenu';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OtpPage } from './pages/auth/OtpPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">☁️ Cloud Kitchen</h1>
          <div className="flex gap-4">
            <a href="/login" className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">Login</a>
            <a href="/register" className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100">Register</a>
          </div>
        </div>
      </header>
      
      <section className="container mx-auto px-4 py-8">
        <RestaurantMenu />
      </section>
    </main>
  );
}

export default App;