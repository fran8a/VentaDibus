import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import MisDibujos from './pages/MisDibujos';
import ComoAdquirir from './pages/ComoAdquirir';
import Precios from './pages/Precios';
import Experiencia from './pages/Experiencia';
import QuienSoy from './pages/QuienSoy';
import AuthSuccess from './pages/AuthSuccess';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MisDibujos />} />
              <Route path="/como-adquirir" element={<ComoAdquirir />} />
              <Route path="/precios" element={<Precios />} />
              <Route path="/experiencia" element={<Experiencia />} />
              <Route path="/quien-soy" element={<QuienSoy />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
