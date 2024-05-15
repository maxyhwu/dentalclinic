import './App.css';
import { BrowserRouter as Router,Route,Routes } from 'react-router-dom';
import MainPage from './MainPage';
import LoginPage from './LoginPage';
import UserPage from './UserPage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={ <MainPage /> } />
          <Route path="/login" element={ <LoginPage /> } />
          <Route path="/user" element={ <UserPage /> } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
