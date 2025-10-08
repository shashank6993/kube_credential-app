import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import IssuePage from './pages/IssuePage';
import VerifyPage from './pages/VerifyPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <h1>🔐 Kube Credential</h1>
          <div className="nav-links">
            <Link to="/" className="nav-link">Issue Credential</Link>
            <Link to="/verify" className="nav-link">Verify Credential</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<IssuePage />} />
            <Route path="/verify" element={<VerifyPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Kube Credential Microservice System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
