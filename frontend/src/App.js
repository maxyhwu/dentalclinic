// App.js
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import UserPage from './UserPage';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/home" element={<MainPage />} />
            <Route path="/" element={<LoginPage />} />
            <Route path="/user" element={<UserPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
