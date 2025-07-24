import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import {
  BleManager,
  Device,
  BleError,
  Characteristic,
} from "react-native-ble-plx";
import { Base64 } from "js-base64";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import styles from "../assets/styles/styles";

export const bleManager = new BleManager();
const DATA_SERVICE_UUID = "00009800-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID = "00009801-0000-1000-8000-00805f9b34fb";

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { text: string; timestamp: string; type: "sent" | "received" }[]
  >([]);
  const [showDeviceList, setShowDeviceList] = useState(true);
  const [showDevicesWithoutName, setShowDevicesWithoutName] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Animation effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isScanning]);

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  function scanForPeripherals() {
    setAllDevices([]);
    setIsScanning(true);
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        setIsScanning(false);
      }
      if (device && (showDevicesWithoutName || device.name)) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  }

  function stopScanning() {
    bleManager.stopDeviceScan();
    setIsScanning(false);
  }

  async function startStreamingData(device: Device) {
    if (device) {
      device.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID,
        onDataUpdate
      );
    }
  }

  const onDataUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error || !characteristic?.value) return;

    const dataInput = Base64.decode(characteristic.value);
    setChatHistory((prev) => [
      ...prev,
      {
        text: dataInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "received",
      },
    ]);
  };

  async function connectToDevice(device: Device) {
    setIsConnecting(true);
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      stopScanning();
      setShowDeviceList(false);
      startStreamingData(deviceConnection);
    } catch (e) {
      console.error("Connection error:", e);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectDevice() {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setShowDeviceList(true);
      setChatHistory([]);
    }
  }

  async function sendDataToPeripheral() {
    if (!connectedDevice || !inputValue.trim()) return;

    try {
      const base64Value = Base64.encode(inputValue);
      await connectedDevice.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Value
      );

      setChatHistory((prev) => [
        ...prev,
        {
          text: inputValue,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "sent",
        },
      ]);
      setInputValue("");
      Keyboard.dismiss();
    } catch (e) {
      console.error("Send error:", e);
    }
  }

  const renderDeviceList = () => (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Devices</Text>
        <TouchableOpacity
          onPress={() => setShowDevicesWithoutName(!showDevicesWithoutName)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleButtonText}>
            {showDevicesWithoutName ? "Hide Nameless" : "Show Nameless"}
          </Text>
        </TouchableOpacity>
      </View>

      {isScanning && allDevices.length === 0 && (
        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialIcons
              name="bluetooth-searching"
              size={48}
              color="#5E7BC7"
            />
          </Animated.View>
          <Text style={styles.loadingText}>Scanning for devices...</Text>
        </View>
      )}

      {allDevices.length === 0 && !isScanning ? (
        <View style={styles.emptyState}>
          <Feather
            name="bluetooth"
            size={48}
            color="#5E7BC7"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No devices found</Text>
          <Text style={styles.emptySubtext}>
            Press the scan button to search for nearby devices
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.deviceList}
          contentContainerStyle={styles.deviceListContent}
        >
          {allDevices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={styles.deviceCard}
              onPress={() => connectToDevice(device)}
              disabled={isConnecting}
            >
              <View style={styles.deviceIcon}>
                <Ionicons name="bluetooth-outline" size={24} color="#5E7BC7" />
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName} numberOfLines={1}>
                  {device.name || "Unnamed Device"}
                </Text>
                <Text style={styles.deviceId} numberOfLines={1}>
                  {device.id}
                </Text>
              </View>
              {isConnecting ? (
                <ActivityIndicator size="small" color="#5E7BC7" />
              ) : (
                <MaterialIcons name="chevron-right" size={24} color="#888" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.scanButtons}>
        {!isScanning ? (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={scanForPeripherals}
          >
            <MaterialIcons name="bluetooth" size={24} color="white" />
            <Text style={styles.scanButtonText}>Scan Devices</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.scanButton, styles.stopScanButton]}
            onPress={stopScanning}
          >
            <MaterialIcons name="stop" size={24} color="white" />
            <Text style={styles.scanButtonText}>Stop Scan</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  const renderChat = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={disconnectDevice} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5E7BC7" />
        </TouchableOpacity>
        <View style={styles.deviceInfoHeader}>
          <Text style={styles.deviceNameHeader} numberOfLines={1}>
            {connectedDevice?.name || "Unnamed Device"}
          </Text>
          <View style={styles.connectionStatus}>
            <View style={styles.connectedIndicator} />
            <Text style={styles.connectionStatusText}>Connected</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        ref={(ref) => {
          if (ref && chatHistory.length > 0) {
            setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
          }
        }}
      >
        {chatHistory.length === 0 ? (
          <View style={styles.emptyChat}>
            <Feather
              name="message-square"
              size={48}
              color="#5E7BC7"
              style={styles.emptyChatIcon}
            />
            <Text style={styles.emptyChatText}>No messages yet</Text>
            <Text style={styles.emptyChatSubtext}>
              Start chatting with your device
            </Text>
          </View>
        ) : (
          chatHistory.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.messageContainer,
                msg.type === "sent"
                  ? styles.sentMessage
                  : styles.receivedMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.type === "sent"
                    ? styles.sentBubble
                    : styles.receivedBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.messageTime}>{msg.timestamp}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={inputValue}
          onChangeText={setInputValue}
          editable={!!connectedDevice}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputValue.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendDataToPeripheral}
          disabled={!inputValue.trim()}
        >
          <MaterialIcons
            name="send"
            size={24}
            color={inputValue.trim() ? "white" : "#aaa"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {showDeviceList ? renderDeviceList() : renderChat()}
    </View>
  );
}
