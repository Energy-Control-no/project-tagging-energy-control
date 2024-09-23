import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { Box, useBreakpointValue } from '@chakra-ui/react'
import Index from './pages/Index'
import ProjectDetails from './pages/ProjectDetails'
import Login from './pages/Login'
import Tasks from './pages/Tasks'
import { useAuth } from './hooks/auth'
import Header from './components/Header'

function App() {
  const padding = useBreakpointValue({ base: 4, md: 6 }) // Adjust padding values as needed
  const { session } = useAuth()

  useEffect(() => {
    document.title = "EC Install";
  }, []);
  
  return (
    <Router>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={padding}
      >
        <Box width="full" maxWidth="900px">
          <Header />
          <Routes>
            <Route
              path="/"
              element={session ? <Index /> : <Navigate to="/login" />}
            />
            <Route
              path="/project/:projectId"
              element={session ? <ProjectDetails /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={!session ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/project/:projectId/tasks"
              element={session ? <Tasks /> : <Navigate to="/login" />}
            />
          </Routes>
        </Box>
      </Box>
    </Router>
  )
}

export default App
