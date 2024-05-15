// src/pages/TaskDeviceLinker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Flex, Text } from "@chakra-ui/react";

const TaskDeviceLinker = ({ setSerialNumber, setDeviceId, linkDevice }) => {
  const [inputValue, setInputValue] = useState('');
  const [parsedSerialNumber, setParsedSerialNumber] = useState('');
  const [parsedDeviceId, setParsedDeviceId] = useState('');
  const inputRef = useRef(null); // Reference for the input element

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Automatically focus the input field when it becomes visible
    }
  }, []);

  const parseInput = (value) => {
    const serialNumberMatch = value.match(/-([0-9]{10})_/); // Updated to match exactly 10 digits
    // Match exactly 6 digits after "_id" considering both forward and back slashes
    const deviceIdMatch = value.match(/_id.*([0-9]{6})/);
    console.log(serialNumberMatch, deviceIdMatch);
    console.log("serialNumberMatch[1]", serialNumberMatch);
    console.log("deviceIdMatch[1]", deviceIdMatch);
    if (serialNumberMatch && deviceIdMatch) {
      const serialNumber = serialNumberMatch[1];
      const deviceId = deviceIdMatch[1];
      setSerialNumber(serialNumber);
      setDeviceId(deviceId);
      setParsedSerialNumber(serialNumber); // Store parsed serial number
      setParsedDeviceId(deviceId); // Store parsed device ID
    } else {
      setParsedSerialNumber(''); // Clear if no match
      setParsedDeviceId(''); // Clear if no match
    }
  };

  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    parseInput(value);
  };

  const handleSubmit = () => {
    linkDevice();
    setInputValue(''); // Clear input after submission
  };

  return (
    <Flex direction="column" align="center" justify="center" p={4}>
      <Input
        ref={inputRef}
        placeholder="Scan QR-code..."
        value={inputValue}
        onChange={handleInputChange}
        mb={2}
      />
      <Text fontSize="md">Serial Number: {parsedSerialNumber}</Text>
      <Text fontSize="md">Device ID: {parsedDeviceId}</Text>
      <Button
        flex="1"
        colorScheme="blue"
        px={4}
        py={2}
        h="48px"
        onClick={handleSubmit}
        isDisabled={!inputValue}
        mt={4}
      >
        Link Device
      </Button>
    </Flex>
  );
};

export default TaskDeviceLinker;
