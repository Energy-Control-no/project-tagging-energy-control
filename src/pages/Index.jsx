import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Input, VStack, Heading, Spinner, useToast, Image, SimpleGrid, useBreakpointValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../hooks/auth";

const fetchProjects = async (access_token) => {
  const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/get_fieldwire_projects`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  const data = await response.json();
  if (!data.projects || !Array.isArray(data.projects)) {
    throw new Error("No projects data available or data is not in expected format");
  }
  return data;
};

const Index = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 3 });

  useEffect(() => {
    setLoading(true);
    fetchProjects(session.access_token)
      .then((data) => {
        setProjects(data.projects);
        setLoading(false);
      })
      .catch((error) => {
        toast({
          title: "Error fetching projects",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        setLoading(false);
      });
  }, []);

  return (
    <Box>
      <Text fontSize="lg" mb={4}>
        Welcome! Please select a Fieldwire project below to print device labels and link Airthings devices.
      </Text>
      <Input variant="outline" placeholder="Search by project name" my="4" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <SimpleGrid columns={columns} spacing={5}>
        {loading ? (
          <Spinner />
        ) : projects.length > 0 ? (
          projects
            .filter((project) => project.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((project) => (
              <Box key={project.id} p={4} borderRadius="md" boxShadow="md" onClick={() => navigate(`/project/${project.id}?name=${encodeURIComponent(project.name)}`)} _hover={{ bg: "gray.100", cursor: "pointer" }}>
                <Flex justifyContent="space-between">
                  <Text fontWeight="bold">{project.name}</Text>
                  <Box width="20px" height="20px" borderRadius="50%" bg={project.color} />
                </Flex>
                <Text fontSize="sm">Created: {format(new Date(project.created_at), "PPP")}</Text>
              </Box>
            ))
        ) : (
          <Text>No projects available.</Text>
        )}
      </SimpleGrid>
    </Box>
  );
};

export default Index;
