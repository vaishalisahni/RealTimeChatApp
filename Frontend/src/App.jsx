import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import {Routes , Route, Navigate} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { useThemeStore } from "./store/useThemeStore.js";
import { useChatStore } from "./store/useChatStore.js";
import {Loader} from "lucide-react";
import {Toaster} from "react-hot-toast";

function App() {
  const {authUser, checkAuth, isCheckingAuth, onlineUsers} = useAuthStore();
  const {theme} = useThemeStore();
  const {requestNotificationPermission} = useChatStore();

  console.log({onlineUsers});

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Request notification permission when user logs in
  useEffect(() => {
    if (authUser) {
      // Request notification permission after a short delay
      setTimeout(() => {
        requestNotificationPermission();
      }, 2000);
    }
  }, [authUser, requestNotificationPermission]);

  if(isCheckingAuth && !authUser) return (
    <div className="flex items-center justify-center h-screen w-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  )

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--fallback-b1,oklch(var(--b1)/var(--tw-bg-opacity)))',
            color: 'var(--fallback-bc,oklch(var(--bc)/var(--tw-text-opacity)))',
            border: '1px solid var(--fallback-b3,oklch(var(--b3)/var(--tw-border-opacity)))',
          },
        }}
      />
    </div>
  );
}

export default App;