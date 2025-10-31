
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import './App.css'
import LoginPage from './pages/loginPage/loginPage';

function App() {

  return (
      <Router> 
          <Routes>
                {/* Ruta principal del microservicio. Cuando se accede a http://localhost:3007/ 
                  (asumiendo ese puerto), renderiza el LoginPage.
                */}
                <Route path="/" element={<LoginPage />} />
            </Routes>
        </Router>
  )
}

export default App
