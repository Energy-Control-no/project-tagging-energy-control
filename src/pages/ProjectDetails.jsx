import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Checkbox, Button, Box, VStack, Heading, Alert, AlertIcon } from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState(null);

  useEffect(() => {
    console.log('Fetching tasks for project:', projectId);
    if (projectId !== lastFetchedId) {
      const fetchTasks = async () => {
        setIsLoading(true);
        setError(null);
        const url = new URL('https://wyq0d1.buildship.run/fieldwire_tasks');
        url.searchParams.append('project_id', projectId);

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.tasks) {
            setTasks(data.tasks);
            setLastFetchedId(projectId); // Update last fetched ID after successful fetch
          } else {
            throw new Error('No tasks found');
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          setError('Failed to load tasks. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };

      fetchTasks();
    }
  }, [projectId]); // Include lastFetchedId in the dependency array

  const handleCheckboxChange = (taskId) => {
    const newSelectedTasks = new Set(selectedTasks);
    if (selectedTasks.has(taskId)) {
      newSelectedTasks.delete(taskId);
    } else {
      newSelectedTasks.add(taskId);
    }
    setSelectedTasks(newSelectedTasks);
  };

  const exportToCSV = () => {
    const selectedTaskData = tasks.filter(task => selectedTasks.has(task.id));
    const csvHeader = "component_label\n";
    const csvContent = selectedTaskData.map(task => `"${task.name || 'Unnamed Task'}"`).join("\n");
    const csvData = csvHeader + csvContent;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tasks.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (isLoading) {
    return <div>Loading...</div>; // Optionally show a loading indicator
  }

  return (
    <Box p={5}>
      <Heading mb={4}>Project Tasks</Heading>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Button leftIcon={<FaPrint />} colorScheme="blue" onClick={exportToCSV}>
          Export Print File
        </Button>
        <Button colorScheme="gray" onClick={() => setSelectedTasks(new Set(tasks.map(task => task.id)))}>
          Select All
        </Button>
        <Button colorScheme="gray" onClick={() => setSelectedTasks(new Set())}>
          Clear Selection
        </Button>
      </Box>
      <VStack align="stretch" spacing={4}>
        {tasks.map(task => (
          <Checkbox key={task.id} isChecked={selectedTasks.has(task.id)} onChange={() => handleCheckboxChange(task.id)}>
            {task.name || 'Unnamed Task'} - Created at: {new Date(task.created_at).toLocaleDateString()}
          </Checkbox>
        ))}
      </VStack>
    </Box>
  );
};

export default ProjectDetails;
