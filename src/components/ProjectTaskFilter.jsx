import React, { useState, useEffect } from "react";
import { Flex, Text, Tag, TagLabel, TagCloseButton, Box } from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";

const ProjectTaskFilter = ({ taskStatuses, taskCategories, onSelectedStatusesChange, onSelectedCategoriesChange }) => {
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleFilterTagClick = (id, selectedItems, setSelectedItems) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems((prevItems) => [...prevItems, id]);
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
    <Flex flexDirection="column" width="100vw">
      <Flex flex="1" alignItems="flex-start" flexDirection="row" width="100%" overflowX="scroll" sx={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <Text size="md" mt={1} width="80px">
          Status:
        </Text>
        <Box flex="1" whiteSpace="normal" display="flex" flexWrap="wrap">
          {taskStatuses.map((taskStatus, index) => (
            <Tag key={index} size="md" colorScheme={selectedStatuses.includes(taskStatus.id) ? "blue" : "gray"} variant={selectedStatuses.includes(taskStatus.id) ? "solid" : "outline"} m={1} onClick={() => handleStatusTagClick(taskStatus.id)} cursor="pointer">
              <TagLabel>{taskStatus.name}</TagLabel>
              {selectedStatuses.includes(taskStatus.id) && <TagCloseButton />}
            </Tag>
          ))}
        </Box>
      </Flex>
      <Flex flex="1" alignItems="flex-start" flexDirection="row" width="100%" overflowX="scroll" sx={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <Text size="md" mt={1} width="80px">
          Category:
        </Text>
        <Box flex="1" whiteSpace="normal" display="flex" flexWrap="wrap">
          {taskCategories.map((taskCategory, index) => (
            <Tag key={index} size="md" colorScheme={selectedCategories.includes(taskCategory.id) ? "blue" : "gray"} variant={selectedCategories.includes(taskCategory.id) ? "solid" : "outline"} m={1} onClick={() => handleCategoryTagClick(taskCategory.id)} cursor="pointer">
              <TagLabel>{taskCategory.name}</TagLabel>
              {selectedCategories.includes(taskCategory.id) && <TagCloseButton />}
            </Tag>
          ))}
        </Box>
      </Flex>
    </Flex>
  );
};

export default ProjectTaskFilter;
