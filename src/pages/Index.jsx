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
  const response = await fetch('https://client-api.us.fieldwire.com/api/v3/account/projects', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Fieldwire-Version': '2024-01-01',
      Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJleHAiOjE3MTUwMzM5NDQsInBheWxvYWQiOnsidXNlcl9pZCI6MTQxOTI3MiwicHVycG9zZSI6ImFwaV9rZXkiLCJzZXNzaW9uX2lkIjoyMzgzMH19.h0xuxZRIYu8kM3cBeGdEYUfNo-plCmw85IUP3CQte_BxkLajIbJA0cb2vzVdG3UZ6mjwO0-7bp0gHYiET99TZUIu1GFG9DFSnr7qZZlD5gRZJdHcXV91vpDi_wgOCgZpkT36XaMPpGOqu0Mut1im5iCt9xC7KklO7KwpTXPx2kKFmonMy27bQMyzRBIxcQFp7tf4yvPjAl1ViRjLupLB8kBETJQiKclDpm-T5RuD1z0u2FB6CeInJDOJXEqSjbc1y47exA8IqZ0KznYT88aRofqVF-x75ou0G1BgI0R-EO5rPKNQTTBOQ88dxxCOw3CemrmBXOYzJlGqoQZCmwggXCeDpA-Esr6laCmvov7SeeWN61JWcIase2RJ3LWcsV3dpOxBLhANIEaubhiXY5BSZlCfezECFEM-iItbHu3tpMqz4Re6L06EPP5e5NlO35u2we2bP2jIh1pOiDGDu0x0jJ-yEVMLjeTkiNTdCvC_0AuOWLewwLRjCRLITgRsa7b8YeLI0BNLd6DTDzdpI9ETd2UWoVAyZWs8s1JQfnkgvw0EgOx_fsvuXH1Q_nmTa4rYS8qbR9xNqL3cK_UImRcgeGfRWyRHtRt1jkTMd0BBAhZyuAGMGrKl6uJ-1dnqgyNpaoBfI_65k48nwDTKj_xBx3p4whvwTyTJE1zEpVP89h0'
    }
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