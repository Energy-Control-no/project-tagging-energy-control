import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Heading,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';

const fetchProjects = async () => {
  const response = await fetch('https://wyq0d1.buildship.run/fieldwire', {
    method: 'GET'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
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
        title: 'Error',
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
        ) : (
          projects.map(project => (
            <Button leftIcon={<FaPrint />} key={project.id} onClick={() => console.log('Print labels for:', project.name)}>
              {project.name}
            </Button>
          ))
        )}
      </VStack>
    </Flex>
  );
};

export default Index;