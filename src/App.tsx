import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MapPage from './pages/Map'
import Ranking from './pages/Ranking'
import Prizes from './pages/Prizes'
import HowItWorks from './pages/HowItWorks'
import Redeem from './pages/Redeem'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/premios" element={<Prizes />} />
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="/resgatar" element={<Redeem />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
