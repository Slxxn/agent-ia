import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
// PAGES_IMPORTS — Claude Code remplace ce commentaire par les vrais imports

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* ROUTES — Claude Code remplace ce commentaire par les vraies routes */}
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
