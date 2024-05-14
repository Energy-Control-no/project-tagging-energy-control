import React, { useState, useEffect } from 'react';
import { Box, Button, Heading } from '@chakra-ui/react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();

  // Parse the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get('name'); // Assuming 'name' is the query parameter

  return (
    <Box>
          <Heading as="h2" size="md" mb={4}>Project: {projectName || projectId}</Heading>
          {/* <Box mb={4}> // Project description goes here
            Skyline Tower is designed to redefine the skyline of the city center. The project aims to create a hub for corporate activities, featuring 500,000 square meters of environmentally sustainable office space.
          </Box> */}
          <Box display="flex" justifyContent="space-between" mb={4}>
            <Button colorScheme="blue" size="lg" variant="outline" p={4}>
              Link Airthings
            </Button>
            <Button colorScheme="blue" size="lg" variant="outline" p={4} onClick={() => navigate(`/project/${projectId}/tasks?name=${encodeURIComponent(projectName)}`)}>
              Go to tasks
            </Button>
          </Box>
    </Box>
  );
};

export default ProjectDetails;
