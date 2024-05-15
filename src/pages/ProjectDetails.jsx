import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Input, FormLabel, FormControl, Alert, Text } from '@chakra-ui/react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Assuming this is the FW_ID
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get('name');

  const [projectData, setProjectData] = useState({
    at_client_id: '',
    at_client_secret: '',
    at_accountId: '',
    at_locationId: ''
  });
  const [projectExists, setProjectExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Example UUID for reference
  const exampleUUID = "123e4567-e89b-12d3-a456-426614174000";

  useEffect(() => {
    // Fetch project data from the database
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/get_project?fw_id=${projectId}`, {
          headers: {
            //'Authorization': `Bearer YOUR_TOKEN_HERE`
          }
        });
        const data = await response.json();
        if (data.length > 0) {
          setProjectData(data[0]);
          setProjectExists(true);
        } else {
          setError('No project has been established yet.');
        }
      } catch (err) {
        setError('Failed to fetch project data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchProject();
  }, [projectId]);

  const handleInputChange = (e) => {
    setProjectData({ ...projectData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/post_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
        body: JSON.stringify({
          fw_id: projectId,
          ...projectData
        })
      });
      if (response.ok) {
        setProjectExists(true);
        setError('');
      } else {
        throw new Error('Failed to save project data.');
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Heading as="h2" size="md" mb={4}>Project: {projectName || projectId}</Heading>
      {error && <Alert status="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <FormControl isRequired>
          <FormLabel>Airthings Client ID</FormLabel>
          <Input name="at_client_id" value={projectData.at_client_id} onChange={handleInputChange} placeholder="Enter Airthings Client ID" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Airthings Client Secret</FormLabel>
          <Input name="at_client_secret" value={projectData.at_client_secret} onChange={handleInputChange} placeholder="Enter Airthings Client Secret" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Airthings Account ID</FormLabel>
          <Input name="at_accountId" value={projectData.at_accountId} onChange={handleInputChange} placeholder="Enter Airthings Account ID" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Airthings Location ID (UUID)</FormLabel>
          <Input name="at_locationId" value={projectData.at_locationId} onChange={handleInputChange} placeholder={`Example UUID: ${exampleUUID}`} />
        </FormControl>
        <Button mt={4} colorScheme="blue" isLoading={loading} type="submit" disabled={!projectData.at_client_id || !projectData.at_client_secret || !projectData.at_accountId || !projectData.at_locationId}>
          Save Project Info
        </Button>
      </form>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button colorScheme="blue" size="lg" variant="outline" p={4} disabled={!projectExists}>
          Link Airthings
        </Button>
        <Button colorScheme="blue" size="lg" variant="outline" p={4} onClick={() => navigate(`/project/${projectId}/tasks?name=${encodeURIComponent(projectName)}`)}>
          Go to tasks
        </Button>
      </Box>
      {projectExists ? null : <Text color="red.500">Please fill in all fields to link Airthings.</Text>}
    </Box>
  );
};

export default ProjectDetails;
