import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Flex, Image, Heading } from '@chakra-ui/react';
import Index from './pages/Index';
import ProjectDetails from './pages/ProjectDetails';
import Login from './pages/Login';
import PrintLabels from './pages/PrintLabels';
import Tasks from './pages/Tasks';

function App() {
  return (
    <Router>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={10}>
        <Box width="full" maxWidth="900px">
          <Flex direction="column" align="start">
            <Image src="/ec_logo.png" alt="EC Logo" htmlWidth="100px" htmlHeight="100px" mb={4} />
            <Heading mb={4} fontFamily="Space Grotesk, sans-serif" color="rgb(16, 56, 48)">
              EC Install
            </Heading>
          </Flex>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/project/:projectId" element={<ProjectDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/project/:projectId/printlabels" element={<PrintLabels />} />
            <Route path="/project/:projectId/tasks" element={<Tasks />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
