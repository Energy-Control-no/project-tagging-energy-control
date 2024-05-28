import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, Flex, Checkbox, Button, Box, VStack, Heading, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Center, Text, ModalFooter, Popover, ButtonGroup, IconButton, Input, CardFooter, Select } from "@chakra-ui/react";
import { FaPrint, FaHashtag, FaSlash } from "react-icons/fa";
import Html5Qrcode from "/src/plugins/Html5QrcodePlugin.jsx";
import ProjectTaskList from "./ProjectTaskList.jsx";

// Parse the QR code text to extract the serial number
const parseQRcodeText = (decodedText) => {
  if (decodedText.includes("gs/")) {
    const parts = decodedText.split(/gs\/(.*?)\?id/); // parsing format: https://a.airthin.gs/123123123?id=232432
    const idParts = parts[2]?.split(/&|=/); // Split by '&' or '=' to handle case where there are more query parameters after 'id'
    return {
      serialNumber: parts[1],
      deviceId: idParts ? idParts[1] : null, // The id is the second part after splitting by '&' or '='
    };
  } else {
    const parts = decodedText.split(/(\d+)/); // parsing format: 2820001088 AZVZVVA
    if (parts.length === 3) {
      return {
        serialNumber: parts[1],
        deviceId: parts[2].trim(),
      };
    }
    return null; // Handle case where pattern doesn't match
  }
};

const Tasks = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [showPrintingSection, setShowPrintingSection] = useState(true);
  const [isHashSelected, setIsHashSelected] = useState(() => {
    const savedHashField = localStorage.getItem("savedHashField-"+projectId); // Read from local storage or use default value
    return savedHashField ? JSON.parse(savedHashField) : true;
  });
  const [selectedFields, setSelectedFields] = useState(() => {
    const savedFields = localStorage.getItem("selectedFields-"+projectId); // Read from local storage or use default fields
    return savedFields ? JSON.parse(savedFields) : ["sequence_number", "team_handle", "name", "team_name"];
  });
  const [taskFields, setTaskFields] = useState(["sequence_number", "name", "created_at"]);

  const serialNumberInputRef = useRef(null);

  // Parse the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const projectName = queryParams.get("name"); // Assuming 'name' is the query parameter

  // Function to navigate back to Project Details
  const handleBackClick = () => {
    navigate(`/project/${projectId}/details`);
  };

  const togglePrintingSection = () => {
    setShowPrintingSection(!showPrintingSection);
  };

  useEffect(() => {
    // Save isHashSelected to local storage whenever it changes
    localStorage.setItem("savedHashField-"+projectId, JSON.stringify(isHashSelected));
  }, [isHashSelected]);

  useEffect(() => {
    // Save selectedFields to local storage whenever it changes
    localStorage.setItem("selectedFields-"+projectId, JSON.stringify(selectedFields));
  }, [selectedFields]);

  useEffect(() => {
    console.log("Fetching tasks for project:", projectId);
    if (projectId !== lastFetchedId) {
      const fetchTasks = async () => {
        setIsLoading(true);
        setError(null);
        const url = new URL("https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/get_fieldwire_tasks");
        url.searchParams.append("project_id", projectId);

        try {
          const response = await fetch(url);
          const data = await response.json();
          if (data.tasks) {
            setTasks(data.tasks);
            setTaskFields(data.tasks.length > 0 ? Object.keys(data.tasks[0]) : []); // Generate taskFields dynamically
            setLastFetchedId(projectId); // Update last fetched ID after successful fetch
          } else {
            throw new Error("No tasks found");
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
          setError("Failed to load tasks. Please try again later.");
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

  const handleFieldChange = (index, event) => {
    const newSelectedFields = [...selectedFields];
    newSelectedFields[index] = event.target.value;
    setSelectedFields(newSelectedFields);
  };

  const handleHashClick = () => {
    setIsHashSelected(!isHashSelected);
  };

  const addField = () => {
    setSelectedFields([...selectedFields, ""]); // Add a new field with empty value
  };

  const removeField = () => {
    if (selectedFields.length > 1) {
      setSelectedFields(selectedFields.slice(0, -1)); // Remove the last field
    }
  };

  const exportToCSV = () => {
    const selectedTaskData = tasks.filter((task) => selectedTasks.has(task.id));
    const csvHeader = "component_label\n";
    const csvContent = selectedTaskData.map((task) => (isHashSelected ? "#" : "") + selectedFields.map((field) => task[field]).join("-")).join("\n");
    const csvData = csvHeader + csvContent;

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "tasks.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSerialNumber(""); // Reset serialNumber state
    setDeviceId(""); // Reset deviceId state
    setModalError(null); // Reset error state to null
    // TO DO: pause the camera
  };

  const formatTaskDisplay = (task) => {
    if (!task) {
      return "Task data is not available";
    }

    // Map over selectedFields and safely access each field in the task, providing a fallback if the field is undefined or null.
    const taskString = selectedFields.map((field) => task[field] || "N/A").join(" - ");
  
    // If isHashSelected is true, add "#" at the beginning of the string
    return isHashSelected ? `#${taskString}` : taskString;
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="md" mb={4}>
          Project Tasks: {projectName || projectId}
        </Heading>
        <Button variant="link" onClick={togglePrintingSection}>
          {showPrintingSection ? "Hide Printing" : "Print Labels"}
        </Button>
      </Box>
      {showPrintingSection && (
        <Box mb={6} p={4} border="1px solid #e2e8f0">
          <Box>
            <Text fontSize="xs" fontFamily="mono">
              Label: {formatTaskDisplay(tasks[0])}
            </Text>
            <Flex direction="row" flexWrap="wrap" mb={4}>
              <Flex alignItems="center">
                <IconButton aria-label="toggle hash" icon={isHashSelected ? <FaHashtag /> : <FaSlash />} size="sm" variant="outline" colorScheme={isHashSelected ? "blue" : "gray"} opacity={isHashSelected ? 1 : 0.3} onClick={handleHashClick}/>
              </Flex>
              {selectedFields.map((field, index) => (
                <>
                  {index !== 0 && (
                    <Flex alignItems="center">
                      {" "}
                      <Text fontSize="sm">-</Text>{" "}
                    </Flex>
                  )}
                  <Select key={index} value={field} maxWidth="108px" fontSize="sm" size="sm" m={0.5} onChange={(e) => handleFieldChange(index, e)}>
                    {taskFields.map((fieldOption) => (
                      <option key={fieldOption} value={fieldOption}>
                        {fieldOption}
                      </option>
                    ))}
                  </Select>
                </>
              ))}
              <Button onClick={removeField} size="sm" m={0.5} minWidth="32px">
                -
              </Button>
              <Button onClick={addField} size="sm" m={0.5} minWidth="32px">
                +
              </Button>
            </Flex>
          </Box>
          <Box display="flex" justifyContent="space-between" gap="6px">
            <Button size="xs" leftIcon={<FaPrint />} colorScheme="blue" px={3} py={4} onClick={exportToCSV}>
              Get Print File
            </Button>

            <div style={{ display: "flex", gap: "6px" }}>
              <Button size="xs" colorScheme="gray" variant="outline" px={3} py={4} onClick={() => setSelectedTasks(new Set(tasks.map((task) => task.id)))}>
                Select All
              </Button>
              <Button size="xs" colorScheme="gray" variant="outline" px={3} py={4} onClick={() => setSelectedTasks(new Set())}>
                Clear Selection
              </Button>
            </div>
          </Box>
        </Box>
      )}

      <ProjectTaskList tasks={tasks} selectedTasks={selectedTasks} handleCheckboxChange={handleCheckboxChange} formatTaskDisplay={formatTaskDisplay} setSelectedTaskForModal={setSelectedTaskForModal} />
    </Box>
  );
};

export default Tasks;
