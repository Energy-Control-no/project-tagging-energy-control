import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody, Flex, Checkbox, Button, Box, VStack, Heading, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Center, Text, ModalFooter, Popover, ButtonGroup, IconButton, Input, CardFooter, Select } from "@chakra-ui/react";
import { FaPrint, FaQrcode } from "react-icons/fa";
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

const postAirthingsDevice = async (payload) => {
  const response = await fetch("https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/post_airthings_device", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to add device");
  }
  return response.json();
};

const Tasks = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [showPrintingSection, setShowPrintingSection] = useState(true);
  const [selectedFields, setSelectedFields] = useState(["sequence_number", "team_handle", "name", "team_name"]); // Default fields
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
    const csvContent = selectedTaskData.map((task) => "#" + selectedFields.map((field) => task[field]).join("-")).join("\n");
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

  const manualEntryClicked = () => {
    if (serialNumberInputRef.current) {
      const input = serialNumberInputRef.current;
      input.focus();
      input.select();
    }
  };

  const linkDevice = async () => {
    try {
      const payload = {
        deviceInfo: {
          deviceId: deviceId,
          deviceName: formatTaskDisplay(selectedTaskForModal),
          serialNumber: serialNumber,
        },
        fw_id: projectId,
        fw_task_id: selectedTaskForModal.id,
      };

      const response = await postAirthingsDevice(payload);

      /* Show successfully linked tasks in the task card
      const newLinkedTask = {
        serialNumber: serialNumber,
        id: deviceId,
        task: selectedTaskForModal,
      };*/
      //setLinkedTasks([...linkedTasks, newLinkedTask]);
      closeModal();
    } catch (error) {
      console.error("Failed to link device:", error);
      setModalError("Failed to link device. Try again.");
    }
  };

  const openModal = (task) => {
    // TO DO: unpause the camera if it exists
    setSelectedTaskForModal(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSerialNumber(""); // Reset serialNumber state
    setDeviceId(""); // Reset deviceId state
    setModalError(null); // Reset error state to null
    // TO DO: pause the camera
  };

  const onNewScanResult = (decodedText, decodedResult) => {
    const parsedText = parseQRcodeText(decodedText);
    if (parsedText) {
      setModalError(null); // Reset error state to null
      setSerialNumber(parsedText.serialNumber);
      setDeviceId(parsedText.deviceId);
    }
  };

  const formatTaskDisplay = (task) => {
    if (!task) {
      return "Task data is not available";
    }

    // Map over selectedFields and safely access each field in the task, providing a fallback if the field is undefined or null.
    return `#${selectedFields.map((field) => task[field] || "N/A").join(" - ")}`;
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
              Label: ${formatTaskDisplay(tasks[0])}
            </Text>
            <Flex direction="row" flexWrap="wrap" mb={4}>
              <Flex alignItems="center">
                <Text fontSize="sm"># </Text>
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

      <ProjectTaskList
        tasks={tasks}
        selectedTasks={selectedTasks}
        handleCheckboxChange={handleCheckboxChange}
        formatTaskDisplay={formatTaskDisplay}
        openModal={openModal}
        setSerialNumber={setSerialNumber}
        setDeviceId={setDeviceId}
        linkDevice={linkDevice}
        setSelectedTaskForModal={setSelectedTaskForModal}
        />

      <Modal isOpen={isModalOpen} onClose={closeModal} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pb={0}>Linking Task {formatTaskDisplay(selectedTaskForModal)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Html5Qrcode fps={10} qrbox={250} disableFlip={false} qrCodeSuccessCallback={onNewScanResult} /> */}
          </ModalBody>
          <ModalFooter flexDirection="column" py={1}>
            <Flex direction="row" alignItems="center" width="100%" mb={2}>
              <Text flex="1" fontWeight="bold" mr={3} mb={2}>
                Serial number:
              </Text>
              <Input ref={serialNumberInputRef} value={serialNumber} placeholder="Scan or enter the serial number" onChange={(e) => setSerialNumber(e.target.value)} variant="flushed" mb={2} />
            </Flex>
            <Flex direction="row" alignItems="center" width="100%" mb={2}>
              <Text flex="1" fontWeight="bold" mr={3} mb={2}>
                DeviceId:
              </Text>
              <Input value={deviceId} placeholder="Scan or enter the device id" onChange={(e) => setDeviceId(e.target.value)} variant="flushed" mb={2} />
            </Flex>
          </ModalFooter>
          {modalError && (
            <ModalFooter pt={1}>
              <Text textAlign="center" width="100%" color="red">
                {modalError}
              </Text>
            </ModalFooter>
          )}
          <ModalFooter justifyContent="center">
            <ButtonGroup width="100%" maxW="420px">
              <Button flex="1" colorScheme="gray" mr={2} px={4} py={2} h="48px" onClick={manualEntryClicked}>
                Enter manually
              </Button>
              <Button flex="1" colorScheme="blue" px={4} py={2} h="48px" onClick={linkDevice} isDisabled={!serialNumber || !deviceId}>
                Link
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Tasks;
