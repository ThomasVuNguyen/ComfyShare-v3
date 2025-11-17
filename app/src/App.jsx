import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { LightboxProvider } from './components/ui/Lightbox'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Library from './pages/Library'
import BookShow from './pages/BookShow'
import BookEdit from './pages/BookEdit'
import LeafEdit from './pages/LeafEdit'
import LeafView from './pages/LeafView'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex align-center justify-center" style={{ minHeight: '100vh' }}>
      <p>Loading...</p>
    </div>
  }

  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex align-center justify-center" style={{ minHeight: '100vh' }}>
      <p>Loading...</p>
    </div>
  }

  return !user ? children : <Navigate to="/" />
}

function App() {
  return (
    <AuthProvider>
      <LightboxProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } />
            <Route path="/book/new" element={
              <ProtectedRoute>
                <BookEdit />
              </ProtectedRoute>
            } />
            <Route path="/book/:bookId" element={<BookShow />} />
            <Route path="/book/:bookId/edit" element={
              <ProtectedRoute>
                <BookEdit />
              </ProtectedRoute>
            } />
            <Route path="/book/:bookId/leaf/:leafId" element={<LeafView />} />
            <Route path="/book/:bookId/leaf/:leafId/edit" element={
              <ProtectedRoute>
                <LeafEdit />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </LightboxProvider>
    </AuthProvider>
  )
}

export default App
