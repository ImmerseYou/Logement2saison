import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import Bookings from './pages/Bookings'
import SolidaryOwners from './pages/SolidaryOwners'
import Labels from './pages/Labels'
import Support from './pages/Support'
import { ChatSupport } from './components/ChatSupport/ChatSupport'
import { ChatProvider, useChat } from './contexts/ChatContext'

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isChatOpen, openChat, closeChat } = useChat();

  return (
    <div className={`min-h-screen ${!isHomePage ? 'bg-gray-50' : ''}`}>
      <div className="relative z-50">
        <Navbar />
      </div>
      
      <main className={!isHomePage ? '' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/solidary-owners" element={<SolidaryOwners />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="/support" element={<Support />} />
        </Routes>
      </main>

      {/* Bouton de chat flottant */}
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-[90]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Composant de chat */}
      <ChatSupport isOpen={isChatOpen} onClose={closeChat} />
    </div>
  )
}

function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  )
}

export default App
