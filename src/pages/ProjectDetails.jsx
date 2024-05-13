import React, { useState, useEffect } from 'react';
import { Box, Button, Heading } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const [details, setDetails] = useState(null);
  const navigate = useNavigate();
  const { projectId } = useParams();

  // useEffect(() => {
  //   const fetchProjectDetails = async () => {
  //     try {
  //       const response = null; // api call!
  //       setDetails(response);
  //     } catch (error) {
  //       // Handle error
  //     }
  //   };

  //   fetchProjectDetails();
  // }, [projectId]);

  return (
    <Box>
          <Heading as="h2" size="md" mb={4}>Project: {details?.name || projectId}</Heading>
          <Box mb={4}>
            Skyline Tower is designed to redefine the skyline of the city center. The project aims to create a hub for corporate activities, featuring 500,000 square meters of environmentally sustainable office space.
          </Box>
          <Box display="flex" justifyContent="space-between" mb={4}>
            <Button colorScheme="blue" size="lg" variant="outline" p={4}>
              Link Airthings
            </Button>
            <Button colorScheme="blue" size="lg" variant="outline" p={4} onClick={() => navigate(`/project/${projectId}/printlabels`)}>
              Print labels
            </Button>
            <Button colorScheme="blue" size="lg" variant="outline" p={4} onClick={() => navigate(`/project/${projectId}/tasks`)}>
              Go to tasks
            </Button>
          </Box>
    </Box>
  );
};

export default ProjectDetails;
