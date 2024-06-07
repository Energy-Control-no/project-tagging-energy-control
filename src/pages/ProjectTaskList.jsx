import React, { useState } from 'react';
import { VStack, Card, CardBody, Flex, Box, Checkbox, Button, Link, Badge, useColorModeValue, Text, Tooltip } from '@chakra-ui/react';
import { FaLink, FaCheckCircle } from 'react-icons/fa';
import ProjectTaskFilter from "../components/ProjectTaskFilter.jsx";
import TaskDeviceLinker from './TaskDeviceLinker';

const ProjectTaskList = ({ tasks, selectedTasks, handleCheckboxChange, formatTaskDisplay, setSelectedTaskForModal }) => {
  const [visibleLinkerTaskId, setVisibleLinkerTaskId] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]); 
  const [selectedCategories, setSelectedCategories] = useState([]);

  const taskStatuses = tasks.reduce((statuses, task) => { // Create a list of unique status objects
    if (!statuses.some(s => s.id === task.status_id)) {
      statuses.push({id: task.status_id, name: task.status_name});
    }
    return statuses;
  }, []);

  const taskCategories = tasks.reduce((categories, task) => { // Create a list of unique category objects
    if (!categories.some(s => s.id === task.team_id)) {
      categories.push({id: task.team_id, name: task.team_name});
    }
    return categories;
  }, []);

  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const linkedColor = useColorModeValue('green.500', 'green.200');

  const handleStatusChange = (selectedStatuses) => {
    setSelectedStatuses(selectedStatuses ? selectedStatuses : []);
  };

  const handleCategoryChange = (selectedCategories) => {
    setSelectedCategories(selectedCategories ? selectedCategories : []);
  };

  const toggleLinkerVisibility = (task) => {
    if (visibleLinkerTaskId === task.id) {
      setVisibleLinkerTaskId(null);
      setSelectedTaskForModal(null);
    } else {
      setVisibleLinkerTaskId(task.id);
      setSelectedTaskForModal(task);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Filter tasks based on selected statuses and categories
  const filteredTasks = tasks.filter(task => 
    (selectedStatuses.length === 0 || selectedStatuses.includes(task.status_id)) &&
    (selectedCategories.length === 0 || selectedCategories.includes(task.team_id))
  );

  // Sort tasks by sequence_number in ascending order
  const sortedTasks = filteredTasks.sort((a, b) => a.sequence_number - b.sequence_number);

  return (
    <VStack align="stretch" spacing={4}>
      <Flex justifyContent="space-between" alignItems="flex-end" width="100%">
        <ProjectTaskFilter taskStatuses={taskStatuses} taskCategories={taskCategories} onSelectedStatusesChange={handleStatusChange} onSelectedCategoriesChange={handleCategoryChange}></ProjectTaskFilter> 
        <Text fontSize="sm" color="gray.500">({sortedTasks.length})</Text>
      </Flex>
      {sortedTasks.map((task) => (
        <Card key={task.id} mb={2} width="100%" borderLeftWidth="5px" borderLeftColor={task.deviceInfo ? linkedColor : borderColor} style={{ padding: '10px', margin: '5px' }}>
          <CardBody p={4}>
            <Flex align="center">
              <Checkbox pr={4} isChecked={selectedTasks.has(task.id)} onChange={() => handleCheckboxChange(task.id)} />
              <Box flex="1">
                <Text fontWeight="bold">{formatTaskDisplay(task)}</Text>
                <Text fontSize="sm">Task category: {task.team_name}</Text>
                <Text fontSize="sm">Created at: {formatDate(task.created_at)}</Text>
                <Text fontSize="xs" color="gray.500">Task ID: {task.id}</Text>
                {task.deviceInfo && (
                  <>
                    <Badge colorScheme="green" variant='solid' mt={4} mb={1} mr={2}>👍 Linked</Badge>
                    <Text fontSize="sm">
                      <b>Linked device:</b> <Link href={`https://dashboard.airthings.com/devices/${task.deviceInfo.at_serialNumber}`} isExternal>
                        {task.deviceInfo.at_deviceName} (SN: {task.deviceInfo.at_serialNumber})
                      </Link>
                      <Tooltip label="View in Airthings Dashboard" hasArrow>
                        <span> 🔗</span>
                      </Tooltip>
                    </Text>
                    <Text fontSize="xs" color="gray.500">Linked on: {formatDate(task.deviceInfo.created_at)}</Text>
                  </>
                )}
              </Box>
              {!task.deviceInfo && (
                <Button leftIcon={<FaLink />} colorScheme="blue" size="sm" onClick={() => toggleLinkerVisibility(task)}>
                  {visibleLinkerTaskId === task.id ? 'Hide Linker' : 'Link Device'}
                </Button>
              )}
            </Flex>
            {visibleLinkerTaskId === task.id && (
              <TaskDeviceLinker
                task={task}
                formattedTaskName={formatTaskDisplay(task)}
              />
            )}
          </CardBody>
        </Card>
      ))}
    </VStack>
  );
};

export default ProjectTaskList;
