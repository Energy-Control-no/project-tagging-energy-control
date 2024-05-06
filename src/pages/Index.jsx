import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Heading,
  Spinner,
  useToast,
  Image,
  SimpleGrid
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const fetchProjects = async () => {
  const response = await fetch('https://wyq0d1.buildship.run/fieldwire', {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = await response.json();
  if (!data.projects || !Array.isArray(data.projects)) {
    throw new Error('No projects data available or data is not in expected format');
  }
  return data;
};

const Index = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchProjects().then(data => {
      setProjects(data.projects);
      setLoading(false);
    }).catch(error => {
      toast({
        title: 'Error fetching projects',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
      setLoading(false);
    });
  }, []);

  return (
        <SimpleGrid columns={3} spacing={5}>
          {loading ? (
            <Spinner />
          ) : projects.length > 0 ? (
            projects.map(project => (
              <Box key={project.id} p={4} borderRadius="md" boxShadow="md" onClick={() => navigate(`/project/${project.id}`)}>
                <Flex justifyContent="space-between">
                  <Text fontWeight="bold">{project.name}</Text>
                  <Box width="20px" height="20px" borderRadius="50%" bg={project.color} />
                </Flex>
                <Text fontSize="sm">Created: {format(new Date(project.created_at), 'PPP')}</Text>
                {project.has_logo && project.logo_url && (
                  <Image src={project.logo_url} alt={`${project.name} Logo`} htmlWidth="120px" htmlHeight="120px" />
                )}
              </Box>
            ))
          ) : (
            <Text>No projects available.</Text>
          )}
        </SimpleGrid>
  );
};

export default Index;
