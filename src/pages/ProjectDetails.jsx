import React, { useState, useEffect } from "react";
import { Link, Box, Button, Heading, Input, FormLabel, FormControl, Alert, Text, VStack } from "@chakra-ui/react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Assuming this is the FW_ID
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get("name");

  const [projectData, setProjectData] = useState({
    at_client_id: "",
    at_client_secret: "",
    at_accountId: "",
    at_locationId: "",
  });
  const [fwProjectData, setFwProjectData] = useState({
    fw_project_id: projectId,
    num_tasks: 0,
    fw_project_name: projectName || "",
  });
  const [projectExists, setProjectExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          },
        });
        const data = await response.json();
        if (data.length > 0) {
          setProjectData(data[0]);
          setProjectExists(true);
        } else {
          setError("No project has been established yet.");
        }

        // Fetch additional Fieldwire project information
        //const fwResponse = await fetch(`https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/get_fieldwire_project_info?fw_id=${projectId}`);
        /*const fwData = await fwResponse.json();
        if (fwData?) {
          setFwProjectData({
            fw_project_id: projectId,
            num_tasks: 0,
            fw_project_name: fwData.name
          });
        }*/
      } catch (err) {
        setError("Failed to fetch project data.");
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
      const response = await fetch("https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/post_project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
        body: JSON.stringify({
          fw_id: projectId,
          ...projectData,
        }),
      });
      if (response.ok) {
        setProjectExists(true);
        setError("");
      } else {
        throw new Error("Failed to save project data.");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        Project: {fwProjectData.fw_project_name || projectId}
      </Heading>
      {error && <Alert status="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Box display="flex" justifyContent="space-between" mt={4} mb={4}>
              <Button colorScheme="blue" size="lg" variant="outline" p={4} onClick={() => navigate(`/project/${projectId}/tasks?name=${encodeURIComponent(fwProjectData.fw_project_name)}`)}>
                Open tasks
              </Button>
            </Box>
            <Box>
              <Heading as="h3" size="lg" mb={2}>
                Fieldwire Project Information
              </Heading>
              <Text fontWeight="bold" marginBottom="4px">
                Fieldwire Project Name
              </Text>
              <Text marginBottom="24px">{fwProjectData.fw_project_name}</Text>

              <Text fontWeight="bold" marginBottom="4px">
                Fieldwire Project ID
              </Text>
              <Text marginBottom="24px">{fwProjectData.fw_project_id}</Text>

              <Text fontWeight="bold" marginBottom="4px">
                Number of Tasks
              </Text>
              <Text marginBottom="24px">{fwProjectData.num_tasks}</Text>
            </Box>
          </Box>
          <Box>
            <Heading as="h3" size="lg" mb={2}>
              Airthings Account Information
            </Heading>
            {projectExists ? null : <Text color="red.500">Please fill in all fields to link Airthings.</Text>}
            <FormControl>
              <FormLabel htmlFor="apiClientId">API Client ID</FormLabel>
              <Input id="apiClientId" placeholder="Enter API Client ID" />
              <Text fontSize="sm" mt="2">
                Go to the{" "}
                <a href="https://dashboard.airthings.com/integrations/api-integration" target="_blank" rel="noopener noreferrer">
                  Airthings client account
                </a>
                , create a new API client in the Integrations menu. Ensure it has access to all scopes and is set to 'Client credentials (machine-to-machine)' flow type. Name it indicating it was created by Energy Control.
              </Text>
            </FormControl>

            <FormControl mt="4">
              <FormLabel htmlFor="apiClientSecret">API Client Secret</FormLabel>
              <Input id="apiClientSecret" placeholder="Enter API Client Secret" />
              <Text fontSize="sm" mt="2">
                After creating the API client, ensure it is active and copy the secret here. The client will also see this in their Airthings dashboard.
              </Text>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="airthingsAccountId">Airthings Account ID</FormLabel>
              <Input id="airthingsAccountId" name="at_accountId" placeholder="Enter Airthings Account ID" />
              <Text fontSize="sm" mt="2">
                Find the Account ID on the{" "}
                <Link href="https://dashboard.airthings.com/integrations" isExternal color="teal.500">
                  Airthings Integrations page
                </Link>
                . Make sure you are logged into the correct account for this user!
              </Text>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="airthingsLocationId">Airthings Location ID (Building ID)</FormLabel>
              <Input id="airthingsLocationId" name="at_locationId" placeholder="Enter Airthings Location ID" />
              <Text fontSize="sm" mt="2">
                To find the Location ID, go to the{" "}
                <Link href="https://dashboard.airthings.com/buildings" isExternal color="teal.500">
                  Airthings dashboard
                </Link>{" "}
                for the specific building. The Location ID is the UUID in the URL, which looks like this: "acd0b858-32e6-4dd5-903b-66c478d6bccd".
              </Text>
            </FormControl>
          </Box>
        </VStack>
        <Button mt={4} colorScheme="blue" isLoading={loading} type="submit" disabled={!projectData.at_client_id || !projectData.at_client_secret || !projectData.at_accountId || !projectData.at_locationId}>
          Save Project Info
        </Button>
      </form>
    </Box>
  );
};

export default ProjectDetails;
