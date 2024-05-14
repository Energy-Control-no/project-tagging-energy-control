import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardBody, Flex, Checkbox, Button, Box, VStack, Heading, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Center, Text, ModalFooter, Popover, ButtonGroup, IconButton, Input, CardFooter, Select} from '@chakra-ui/react';
import { FaPrint, FaQrcode } from 'react-icons/fa';
import Html5Qrcode from '/src/plugins/Html5QrcodePlugin.jsx';

// Parse the QR code text to extract the serial number
const parseQRcodeText = (decodedText) => {
  if (decodedText.includes('gs/')) {
    // parsing format: https://a.airthin.gs/123123123?id=232432
    const parts = decodedText.split(/gs\/(.*?)\?id/);
    return {
      before: parts[0],
      serialNumber: parts[1],
      after: parts[2]
    };
  } else {
    // parsing format: 2820001088 AZVZVVA
    const parts = decodedText.split(/(\d+)/);
    if (parts.length === 3) {
      return {
        before: parts[0],
        serialNumber: parts[1],
        after: parts[2]
      };
    }
    return null; // Handle case where pattern doesn't match
  }
};

const Tasks = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [linkedTasks, setLinkedTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [showPrintingSection, setShowPrintingSection] = useState(false);
  const [selectedFields, setSelectedFields] = useState(['sequence_number', 'name']); // Default fields
  const [taskFields, setTaskFields] = useState(['sequence_number', 'name', 'created_at']);

  const serialNumberInputRef = useRef(null);

  const togglePrintingSection = () => {
    setShowPrintingSection(!showPrintingSection);
  };

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
            setTaskFields(data.tasks.length > 0 ? Object.keys(data.tasks[0]) : []); // Generate taskFields dynamically
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

  const handleFieldChange = (index, event) => {
    const newSelectedFields = [...selectedFields];
    newSelectedFields[index] = event.target.value;
    setSelectedFields(newSelectedFields);
  };

  const addField = () => {
    setSelectedFields([...selectedFields, '']); // Add a new field with empty value
  };

  const removeField = () => {
    if (selectedFields.length > 1) {
      setSelectedFields(selectedFields.slice(0, -1)); // Remove the last field
    }
  };

  const exportToCSV = () => {
    const selectedTaskData = tasks.filter(task => selectedTasks.has(task.id));
    const csvHeader = "component_label\n";
    const csvContent = selectedTaskData.map(task => "#" + selectedFields.map(field => task[field]).join('-')).join("\n");
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

  const manualEntryClicked = () => {
    if (serialNumberInputRef.current) {
        const input = serialNumberInputRef.current;
        input.focus();
        input.select();
      }
  };

  const linkDevice = () => {
    // Placeholder function for linking device to tag
    console.log('Linking device and tag ...');
    console.log('Device serial number:', serialNumber);
    console.log('Tag sequence number:', selectedTaskForModal.sequence_number);
    console.log('Tag ID:', selectedTaskForModal.id);
    // Create a new linked task object
      const newLinkedTask = {
        serialNumber: serialNumber,
        task: selectedTaskForModal
      };

      setLinkedTasks([...linkedTasks, newLinkedTask]);
      closeModal();
  };

  const openModal = (task) => {
    // TO DO: unpause the camera if it exists
    setSelectedTaskForModal(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSerialNumber(""); // Reset serialNumber state to null
    // TO DO: pause the camera
  };

  const onNewScanResult = (decodedText, decodedResult) => {
    const parsedText = parseQRcodeText(decodedText);
    if (parsedText) {
      setSerialNumber(parsedText.serialNumber);
    }
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
        <Heading as="h2" size="md" mb={4}>Project Tasks</Heading>
        <Button variant="link" onClick={togglePrintingSection}>
          {showPrintingSection ? 'Hide Printing' : 'Print Labels'}
        </Button>
      </Box>
      {showPrintingSection && (
        <Box my={2}>
            <Box>
                <Text fontSize="xs" color="gray.400" fontFamily="mono">
                    Label: #{selectedFields.map(field => tasks[0][field]).join('-')}
                </Text>
                <Flex direction="row" flexWrap="wrap" mb={6}>
                    <Flex alignItems="center"><Text fontSize="sm"># </Text></Flex>
                    {selectedFields.map((field, index) => (
                        <>
                        {index !== 0 && <Flex alignItems="center"> <Text fontSize="sm">-</Text> </Flex>}
                        <Select key={index} value={field} maxWidth="108px" fontSize="sm" size="sm" m={0.5} onChange={(e) => handleFieldChange(index, e)}>
                            {taskFields.map((fieldOption) => (
                            <option key={fieldOption} value={fieldOption}>{fieldOption}</option>
                            ))}
                        </Select>
                        </>
                    ))}
                    <Button onClick={removeField} size="sm" m={0.5} minWidth="32px">-</Button>
                    <Button onClick={addField} size="sm" m={0.5} minWidth="32px">+</Button>
                </Flex>
            </Box>
            <Box display="flex" justifyContent="space-between" gap='6px' mb={5}>
                <Button size="xs" leftIcon={<FaPrint />} colorScheme="blue" px={3} py={4} onClick={exportToCSV}>
                Export Print File
                </Button>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                    <Button size="xs" colorScheme="gray" variant="outline" px={3} py={4} onClick={() => setSelectedTasks(new Set(tasks.map(task => task.id)))}>
                    Select All
                    </Button>
                    <Button size="xs" colorScheme="gray" variant="outline" px={3} py={4} onClick={() => setSelectedTasks(new Set())}>
                    Clear Selection
                    </Button>
                </div>
            </Box>
            
        </Box>
      )}

      <VStack align="stretch" spacing={4}>
        {tasks.map(task => {
            // Check if the task is linked
            const linkedTask = linkedTasks.find(linkedTask => linkedTask.task.id === task.id);
            return (
              <Card key={task.id} mb={2} width="100%">
                <CardBody p={4}>
                  <Flex justify="space-between" align="center">
                  {showPrintingSection && (
                      <div><Checkbox isChecked={selectedTasks.has(task.id)} onChange={() => handleCheckboxChange(task.id)} /></div>
                  )}
                      <div style={{ fontSize: 'smaller' }}>
                          <p>#{task.sequence_number} - {task.name || 'Unnamed Task'}</p>
                          <p>Created at: {new Date(task.created_at).toLocaleDateString()}</p>
                      </div>
                      <IconButton icon={<FaQrcode />} size="md" aria-label="Link Device" colorScheme="blue" onClick={() => openModal(task)}/>
                  </Flex>
                </CardBody>
                  {linkedTask && (
                  <CardFooter p={4} pt={0}>
                      <Text fontSize="xs" color="green">Linked to: {linkedTask.serialNumber}</Text>
                  </CardFooter>
                  )}
              </Card>
              );
            })}
          </VStack>

      <Modal isOpen={isModalOpen} onClose={closeModal} size="full">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Linking Task {selectedTaskForModal?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Html5Qrcode
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
                />
            </ModalBody>
            <ModalFooter flexDirection="column" alignItems="center">
                <Text fontWeight="bold" fontSize="xl" mb={2} textAlign="center" width="100%">Serial number:</Text>
                <Input ref={serialNumberInputRef} value={serialNumber} placeholder="Scan or enter the serial number" onChange={(e) => setSerialNumber(e.target.value)} variant="flushed" textAlign="center" width="100%" fontSize="md" mb={2}/>
            </ModalFooter>
            <ModalFooter justifyContent="center">
            <ButtonGroup width="100%" maxW="420px">
            <Button flex="1" colorScheme="gray" mr={2} px={4} py={2} h="48px" onClick={manualEntryClicked}>
                Enter manually
            </Button>
            <Button flex="1" colorScheme="blue" px={4} py={2} h="48px" onClick={linkDevice} isDisabled={!serialNumber}>Link</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Tasks;
