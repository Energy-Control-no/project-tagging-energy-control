import React, { useState, useEffect } from "react";
import { Flex, Link, Box, Button, Heading, Input, FormLabel, FormControl, Alert, Text, VStack, Select } from "@chakra-ui/react";
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { FaSyncAlt } from "react-icons/fa";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FIELDWIRE_CONSTANTS } from '../constants/Fieldwire.constants';


const ProjectDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Assuming this is the FW_ID
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get("name");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [accountId, setAccountId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [accountOptions, setAccountOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);

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
  const [airthingsError, setAirthingsError] = useState("");

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
          setClientId(data[0].at_client_id);
          setClientSecret(data[0].at_client_secret);
          if (data[0].at_client_id && data[0].at_client_secret) {
            const accountsData = await fetchAccounts(data[0].at_client_id, data[0].at_client_secret);
            if (accountsData?.accounts.length > 0) {
              await fetchLocations(data[0].at_client_id, data[0].at_client_secret, accountsData.accounts[0].id);
            }
          }
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

  const fetchAccounts = async (clientIdParam = clientId, clientSecretParam = clientSecret) => {
    setLoadingAccounts(true);
    try {
      const response = await fetch('https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/get_airthings_accounts?client_id=' + clientIdParam + '&client_secret=' + clientSecretParam);
      const data = await response.json();
      if (response.ok) {
        setAccountOptions(data.accounts ? data.accounts : []);
        setLoadingAccounts(false);
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch accounts with provided credentials.");
      }
    } catch (error) {
      setAirthingsError(error.message);
      console.error('Failed to fetch accounts', error);
    }
    setLoadingAccounts(false);
  };
    
  const fetchLocations = async (clientIdParam = clientId, clientSecretParam = clientSecret, accountIdParam = accountId) => {
    setLoadingLocations(true);
    try {
      const response = await fetch('https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/get_airthings_locations?client_id=' + clientIdParam + '&client_secret=' + clientSecretParam + '&account_id=' + accountIdParam);
      const data = await response.json();
      if (response.ok) {
        setLocationOptions(data.locations ? data.locations : []);
        setLoadingLocations(false);
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch locations with provided credentials.");
      }
    } catch (error) {
      setAirthingsError(error.message);
      console.error('Failed to fetch locations', error);
    }
    setLoadingLocations(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    switch (name) {
      case 'at_client_id':
        setClientId(value);
        break;
      case 'at_client_secret':
        setClientSecret(value);
        break;
      case 'at_accountId':
        setAccountId(value);
        break;
      case 'at_locationId':
        setLocationId(value);
        break;
      default:
        break;
    }
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
      <Flex justifyContent="space-between" mt={4} mb={4}>
        <Button colorScheme="blue" size="lg" variant="outline" p={4} onClick={() => navigate(`/project/${projectId}/tasks?name=${encodeURIComponent(fwProjectData.fw_project_name)}`)}>
          Open task list
        </Button>
        <Link href="https://www.loom.com/share/95a42d5de552416c9415b55c50b5ea75?sid=f0ff8f0a-a74b-4f0f-9d9d-e6685d559327" isExternal>
          <Button colorScheme="blue" size="lg" p={4} leftIcon={<i className="fas fa-video"></i>}>
            Watch Tutorial 🎥
          </Button>
        </Link>
      </Flex>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Box>
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
              <Text fontWeight="bold" marginBottom="4px">
                Fieldwire Project Link
              </Text>
              <Button as="a" href={FIELDWIRE_CONSTANTS.getProjectUrl(fwProjectData.fw_project_id)} target="_blank" rel="noopener noreferrer" rightIcon={<ArrowForwardIcon />} colorScheme="teal" variant="outline">
                Open Fieldwire Project
              </Button>
            </Box>
          </Box>
          <Box>
            <Heading as="h3" size="lg" mb={2}>
              Airthings Account Information
            </Heading>
            {airthingsError && <Alert status="error">{airthingsError}</Alert>}
            {projectExists ? null : <Text color="red.500">Please fill in all fields to link Airthings.</Text>}
            <FormControl>
              <FormLabel htmlFor="apiClientId">API Client ID</FormLabel>
              <Input id="at_client_id" name="at_client_id" value={projectData.at_client_id} onChange={handleInputChange} placeholder="Enter API Client ID" />{" "}
              <Text fontSize="sm" mt="2" color="gray.500">
                Go to the{" "}
                <a href="https://dashboard.airthings.com/integrations/api-integration" target="_blank" rel="noopener noreferrer">
                  Airthings client account
                </a>
                , create a new API client in the Integrations menu. Ensure it has access to all scopes and is set to 'Client credentials (machine-to-machine)' flow type. Name it indicating it was created by Energy Control.
              </Text>
            </FormControl>

            <FormControl mt="4">
              <FormLabel htmlFor="apiClientSecret">API Client Secret</FormLabel>
              <Input id="at_client_secret" name="at_client_secret" value={projectData.at_client_secret} onChange={handleInputChange} placeholder="Enter API Client Secret" />{" "}
              <Text fontSize="sm" mt="2" color="gray.500">
                After creating the API client, ensure it is active and copy the secret here. The client will also see this in their Airthings dashboard.
              </Text>
            </FormControl>

            <FormControl mt="4" isRequired>
              <FormLabel htmlFor="airthingsAccountId">Airthings Account ID</FormLabel>
              <Flex alignItems="center">
                <Select id="at_accountId" name="at_accountId" value={projectData.at_accountId} onChange={handleInputChange} placeholder={loadingAccounts ? "Not Set" : "Select Account"} width="auto" flexGrow={1}>
                  {accountOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </Select>
                <Button ml={2} onClick={() => fetchAccounts()} size="sm" isLoading={loadingAccounts} loadingText="Loading...">
                  <FaSyncAlt />
                </Button>
              </Flex>
            </FormControl>
            <FormControl mt="4" isRequired>
            <FormLabel htmlFor="airthingsLocationId">Airthings Location ID (Building ID)</FormLabel>
              <Flex alignItems="center">
                <Select id="at_locationId" name="at_locationId" value={projectData.at_locationId} onChange={handleInputChange} placeholder={loadingLocations ? "Not Set" : "Select Location"} width="auto" flexGrow={1}>
                  {locationOptions.map((option) => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </Select>
                <Button ml={2} onClick={() => fetchLocations()} size="sm" isLoading={loadingLocations} loadingText="Loading...">
                  <FaSyncAlt />
                </Button>
              </Flex>
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
