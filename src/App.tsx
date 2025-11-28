import { useState } from 'react';
import { Login } from './components/Login';
import { DashboardSindico } from './components/DashboardSindico';
import { DashboardMorador } from './components/DashboardMorador';
import { User } from './types';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './utils/ThemeContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <ThemeProvider>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.role === 'sindico' ? (
        <DashboardSindico user={user} onLogout={handleLogout} />
      ) : (
        <DashboardMorador user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
      )}
      <Toaster />
    </ThemeProvider>
  );
}