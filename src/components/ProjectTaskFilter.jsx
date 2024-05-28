import React, { useState, useEffect } from 'react';
import { Flex, Text, Tag, TagLabel, TagCloseButton } from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';

const ProjectTaskFilter = ({ taskStatuses, onSelectedStatusesChange }) => {
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const handleTagClick = (statusId) => {
    if (selectedStatuses.includes(statusId)) {
      setSelectedStatuses(selectedStatuses.filter(id => id !== statusId));
    } else {
      setSelectedStatuses(prevStatuses => [...prevStatuses, statusId]);
    }
  };

  // Call the callback function whenever selectedStatuses changes
  useEffect(() => {
    onSelectedStatusesChange(selectedStatuses);
  }, [selectedStatuses, onSelectedStatusesChange]);

  return (
  <Flex flex="1" alignItems="center" flexDirection="row">
      <Text size="md">Status:</Text>
      {taskStatuses.map((taskStatus, index) => (
        <Tag key={index} size="md" colorScheme={selectedStatuses.includes(taskStatus.id) ? "blue" : "gray"} variant={selectedStatuses.includes(taskStatus.id) ? "solid" : "outline"} m={1} onClick={() => handleTagClick(taskStatus.id)} cursor="pointer">
          <TagLabel>{taskStatus.name}</TagLabel>
          {selectedStatuses.includes(taskStatus.id) && <TagCloseButton />}
        </Tag>
      ))}
    </Flex>
  );
};

export default ProjectTaskFilter;
