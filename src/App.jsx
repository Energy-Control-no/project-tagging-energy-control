import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Flex, Image, Heading, useBreakpointValue } from '@chakra-ui/react';
import Index from './pages/Index';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import Tasks from './pages/Tasks';

function App() {
  const padding = useBreakpointValue({ base: 4, md: 6 }); // Adjust padding values as needed

  useEffect(() => {
    document.title = "EC Install";
  }, []);

  return (
    <Router>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={padding}>
        <Box width="full" maxWidth="900px">
          <Flex direction="column" align="start">
            <Box as={Link} to="/" mb={4}>
              <Image src="/ec_logo.png" alt="EC Logo" htmlWidth="100px" htmlHeight="100px" />
            </Box>
            <Heading mb={4} fontFamily="Space Grotesk, sans-serif" color="rgb(16, 56, 48)">
              EC Install
            </Heading>
          </Flex>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project/:projectId" element={<ProjectDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/project/:projectId/tasks" element={<Tasks />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
