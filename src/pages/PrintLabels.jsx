import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Checkbox, Button, Box, VStack, Heading, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Center, Text, ModalFooter, Popover, ButtonGroup } from '@chakra-ui/react';
import { FaPrint } from 'react-icons/fa';
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

const PrintLabels = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchedId, setLastFetchedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
  const [serialNumber, setSerialNumber] = useState(null);

  useEffect(() => {
    console.log('Fetching tasks for project:', projectId);
    if (projectId !== lastFetchedId) {
      const fetchTasks = async () => {
        setIsLoading(true);
        setError(null);
        const url = new URL('https://rykjmxrsxfstlagfrfnr.supabase.co/functions/v1/get_fieldwire_tasks');
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
    const csvContent = selectedTaskData.map(task => `"#${task.sequence_number} - ${task.name || 'Unnamed Task'}"`).join("\n");
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

  const linkDevice = () => {
    // Placeholder function for linking device to tag
    console.log('Linking device and tag ...');
    console.log('Device serial number:', serialNumber);
    console.log('Tag sequence number:', selectedTaskForModal.sequence_number);
    console.log('Tag ID:', selectedTaskForModal.id);
  };

  const openModal = (task) => {
    setSelectedTaskForModal(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSerialNumber(null); // Reset serialNumber state to null
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
          <Box key={task.id} display="flex" alignItems="center">
            <Checkbox isChecked={selectedTasks.has(task.id)} onChange={() => handleCheckboxChange(task.id)} />
            <Box ml={2} onClick={() => openModal(task)} cursor="pointer">
              #{task.sequence_number} - {task.name || 'Unnamed Task'} - Created at: {new Date(task.created_at).toLocaleDateString()}
            </Box>
          </Box>
        ))}
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
          <ModalFooter justifyContent="center">
            <Text fontWeight="bold" fontSize="xl" mb={2} textAlign="center" width="100%">Serial number: {serialNumber || 'No QR code detected'}</Text>
          </ModalFooter>
          <ModalFooter justifyContent="center">
            <ButtonGroup width="100%" maxW="420px">
              <Button flex="1" colorScheme="gray" mr={2} px={4} py={2} h="48px">Enter manually</Button>
              <Button flex="1" colorScheme="blue" px={4} py={2} h="48px" onClick={linkDevice} isDisabled={!serialNumber}>Link</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PrintLabels;