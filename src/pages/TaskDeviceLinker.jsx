import React, { useState, useEffect, useRef } from "react";
import { Input, Button, Flex, Text, Box, FormControl, FormLabel, Alert, AlertIcon } from "@chakra-ui/react";
import { useAuth } from "../hooks/auth";

const TaskDeviceLinker = ({ task, formattedTaskName, onLinkSuccess }) => {
  const [inputValue, setInputValue] = useState("");
  const [serialNumber, setSerialNumberState] = useState("");
  const [deviceId, setDeviceIdState] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [serialNumberWarning, setSerialNumberWarning] = useState("");
  const [deviceIdWarning, setDeviceIdWarning] = useState("");
  const inputRef = useRef(null);
  const { session } = useAuth();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const parseInput = (value) => {
    let serialNumberMatch = "";
    let deviceIdMatch = "";
    switch (true) {
      case /\d{10,} [A-Z0-9]{7}/.test(value): // matches: 2969020562 KKXSYYT
        serialNumberMatch = value.slice(0, 10);
        deviceIdMatch = value.slice(11, 18);
        break;
      case /^\d+$/.test(value): // 029301597170
        serialNumberMatch = value.replace(/^0+|0+$/g, "");
        break;
      case /airthin.gs/.test(value): // httpsØ–a.airthin.gs-3130000781_id\803142
        serialNumberMatch = value.match(/[0-9]{10}/)[0];
        deviceIdMatch = value.match(/\d+$/)[0];
        break;
    }
    setSerialNumberState(serialNumberMatch);
    checkSerialNumber(serialNumberMatch);
    setDeviceIdState(deviceIdMatch);
    checkDeviceId(deviceIdMatch);
  };

  // Checks the serial number length
  const checkSerialNumber = (value) => {
    if (!/^\d{10}$/.test(value) && value !== "") {
      setSerialNumberWarning("Serial number must be 10 digits"); // Set the warning message
    } else {
      setSerialNumberWarning(""); // Clear the warning message
    }
  };

  // Checks the device ID length and format
  const checkDeviceId = (value) => {
    if (!/^[A-Z0-9]{6,7}$/i.test(value) && value !== "") {
      setDeviceIdWarning("Device ID must be 6 or 7 characters (numbers or letters)"); // Set the warning message
    } else {
      setDeviceIdWarning(""); // Clear the warning message
    }
  };

  const handleInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
    parseInput(value);
  };

  const handleSubmit = () => {
    linkDevice(task, serialNumber, deviceId);
    setInputValue("");
  };

  const postAirthingsDevice = async (payload) => {
    const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/post_airthings_device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to add device");
    }
    return response.json();
  };

  const linkDevice = async (task, serialNumber, deviceId) => {
    try {
      const payload = {
        deviceInfo: {
          deviceId: deviceId,
          deviceName: formattedTaskName,
          serialNumber: serialNumber,
        },
        fw_id: task.project_id,
        fw_task_id: task.id,
      };

      const response = await postAirthingsDevice(payload);
      setMessage(response.message); // Set the success message
      setError(""); // Clear any previous errors
      if (onLinkSuccess) {
        onLinkSuccess(payload);
      }
    } catch (error) {
      console.error("Failed to link device:", error);
      setError(error.message);
      setMessage(""); // Clear any previous success message
    }
  };

  return (
    <Flex direction="column" align="center" justify="center" p={4} width="full">
      <Input ref={inputRef} placeholder="Scan QR-code..." value={inputValue} onChange={handleInputChange} mb={4} width="50%" />
      <FormControl id="serial-number" mb={4} width="50%">
        <FormLabel>Serial Number</FormLabel>
        <Input
          placeholder="Enter or scan Serial Number..."
          value={serialNumber}
          onChange={(e) => {
            setSerialNumberState(e.target.value);
            checkSerialNumber(e.target.value);
          }}
        />
        {serialNumberWarning && <Text color="orange">{serialNumberWarning}</Text>}
      </FormControl>
      <FormControl id="device-id" mb={4} width="50%">
        <FormLabel>Device ID</FormLabel>
        <Input
          placeholder="Enter or scan Device ID..."
          value={deviceId}
          onChange={(e) => {
            setDeviceIdState(e.target.value);
            checkDeviceId(e.target.value);
          }}
        />
        {deviceIdWarning && <Text color="orange">{deviceIdWarning}</Text>}
      </FormControl>
      <Button colorScheme="blue" px={4} py={2} h="48px" onClick={handleSubmit} isDisabled={!serialNumber || !deviceId || deviceIdWarning || serialNumberWarning} mt={4}>
        Link Device
      </Button>
      {message && (
        <Alert status="success" mt={4}>
          <AlertIcon />
          {message}
        </Alert>
      )}
      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
    </Flex>
  );
};

export default TaskDeviceLinker;
