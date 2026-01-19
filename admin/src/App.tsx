import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { UsersPage } from './pages/UsersPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { MKOINPage } from './pages/MKOINPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<div className="text-center mt-20 text-2xl text-gray-500">Welcome to Admin Dashboard</div>} />
              <Route path="users" element={<UsersPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="mkoin" element={<MKOINPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
