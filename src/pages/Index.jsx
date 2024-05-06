import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Heading,
  Spinner,
  useToast,
  SimpleGrid,
  Image
} from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';

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
    <Flex direction="column" align="center" justify="center" p={10}>
      <Heading mb={4}>Energy Control Project Tagging System</Heading>
      <VStack spacing={5}>
        {loading ? (
          <Spinner />
        ) : projects.length > 0 ? (
          <SimpleGrid columns={{ sm: 1, md: 2, lg: 3 }} spacing={10}>
            {projects.map(project => (
              <Box key={project.id} bg={project.color} p={5} shadow="md" borderWidth="1px" borderRadius="lg">
                <Flex direction="column" align="center" justify="center">
                  {project.logo && <Image src={project.logo} alt="Project logo" boxSize="50px" mb={4} />}
                  <Text fontWeight="bold" mb={2}>{project.name}</Text>
                  <Text fontSize="sm">Created at: {new Date(project.created_at).toLocaleDateString()}</Text>
                  <Button leftIcon={<FaPrint />} mt={4} onClick={() => console.log('Print labels for:', project.name)}>
                    Print Labels
                  </Button>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text>No projects available.</Text>
        )}
      </VStack>
    </Flex>
  );
};

export default Index;