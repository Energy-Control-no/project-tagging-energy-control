import React, { useState, useEffect } from 'react';
import { Flex, Text, Tag, TagLabel, TagCloseButton } from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';

const ProjectTaskFilter = ({ taskStatuses, taskCategories, onSelectedStatusesChange, onSelectedCategoriesChange }) => {
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleFilterTagClick = (id, selectedItems, setSelectedItems) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems(prevItems => [...prevItems, id]);
    }
  };

  const handleStatusTagClick = (statusId) => handleFilterTagClick(statusId, selectedStatuses, setSelectedStatuses);

  const handleCategoryTagClick = (categoryId) => handleFilterTagClick(categoryId, selectedCategories, setSelectedCategories);

  // Call the callback function whenever selectedStatuses changes
  useEffect(() => {
    onSelectedStatusesChange(selectedStatuses);
  }, [selectedStatuses, onSelectedStatusesChange]);

  // Call the callback function whenever selectedStatuses changes
  useEffect(() => {
    onSelectedCategoriesChange(selectedCategories);
  }, [selectedCategories, onSelectedCategoriesChange]);

  return (
    <Flex flexDirection="column">
      <Flex flex="1" alignItems="center" flexDirection="row" overflowX="auto" whiteSpace="nowrap">
        <Text size="md">Status:</Text>
        {taskStatuses.map((taskStatus, index) => (
          <Tag key={index} size="md" colorScheme={selectedStatuses.includes(taskStatus.id) ? "blue" : "gray"} variant={selectedStatuses.includes(taskStatus.id) ? "solid" : "outline"} m={1} onClick={() => handleStatusTagClick(taskStatus.id)} cursor="pointer">
            <TagLabel>{taskStatus.name}</TagLabel>
            {selectedStatuses.includes(taskStatus.id) && <TagCloseButton />}
          </Tag>
        ))}
      </Flex>
      <Flex flex="1" alignItems="center" flexDirection="row" overflowX="auto" whiteSpace="nowrap">
        <Text size="md">Category:</Text>
        {taskCategories.map((taskCategory, index) => (
          <Tag key={index} size="md" colorScheme={selectedCategories.includes(taskCategory.id) ? "blue" : "gray"} variant={selectedCategories.includes(taskCategory.id) ? "solid" : "outline"} m={1} onClick={() => handleCategoryTagClick(taskCategory.id)} cursor="pointer">
            <TagLabel>{taskCategory.name}</TagLabel>
            {selectedCategories.includes(taskCategory.id) && <TagCloseButton />}
          </Tag>
        ))}
      </Flex>
    </Flex>
  );
};

export default ProjectTaskFilter;
