import React from 'react';
import { VStack, Card, CardBody, Flex, Box, Checkbox, IconButton } from '@chakra-ui/react';
import { FaQrcode } from 'react-icons/fa';

const ProjectTaskList = ({ tasks, selectedTasks, handleCheckboxChange, formatTaskDisplay, openModal }) => {
    return (
      <VStack align="stretch" spacing={4}>
        {tasks.map((task) => (
          <Card key={task.id} mb={2} width="100%">
            <CardBody p={4}>
              <Flex>
                <Box>
                  <Checkbox pr={4} isChecked={selectedTasks.has(task.id)} onChange={() => handleCheckboxChange(task.id)} />
                </Box>
                <Box flex="1" style={{ fontSize: "smaller" }}>
                  <p><b>{formatTaskDisplay(task)}</b></p>
                  <p>Created at: {new Date(task.created_at).toLocaleDateString()}</p>
                  <p>ID: {task.id}</p>
                </Box>
                <IconButton icon={<FaQrcode />} ml={2} size="md" aria-label="Link Device" colorScheme="blue" onClick={() => openModal(task)} />
              </Flex>
            </CardBody>
          </Card>
        ))}
      </VStack>
    );
  };
  
  export default ProjectTaskList;