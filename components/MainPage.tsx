import React from "react";
import { useState } from "react";
import {
  Button,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  BleManager,
  Device,
  BleError,
  Characteristic,
} from "react-native-ble-plx";
import styles from "../assets/styles/styles";
import ParallaxScrollView from "./ParallaxScrollView";
import { Base64 } from "js-base64";

export const bleManager = new BleManager();
let showDevicesWithoutName = false;
const DATA_SERVICE_UUID = "9800";
const CHARACTERISTIC_UUID = "9801";

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [dataReceived, setDataReceived] = useState<string>(
    "Waiting for data..."
  );
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  function scanForPeripherals() {
    setIsScanning(true);
    console.log("Scanning for peripherals...");
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        setIsScanning(false);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
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
    } else {
      console.log("No Device Connected");
    }
  }

  const onDataUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.error(error);
      return;
    } else if (!characteristic?.value) {
      console.warn("No Data was received!");
      return;
    }

    const dataInput = Base64.decode(characteristic.value);
    setDataReceived(dataInput);
  };

  async function connectToDevice(device: Device) {
    setIsConnecting(true);
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      stopScanning();
      startStreamingData(deviceConnection);
    } catch (e) {
      console.error("FAILED TO CONNECT", e);
    } finally {
      setIsConnecting(false);
    }
  }

  function disconnectDevice() {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setDataReceived("Disconnected. Waiting for data...");
    }
  }

  return (
    <View style={styles.containerScreen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.textTitle}>BLE Device Scanner</Text>

        {/* Connection Status */}
        {connectedDevice ? (
          <View style={styles.connectionStatus}>
            <View style={[styles.statusIndicator, styles.connected]} />
            <Text style={styles.statusText}>
              Connected to: {connectedDevice.name || "Unnamed Device"}
            </Text>
          </View>
        ) : (
          <View style={styles.connectionStatus}>
            <View style={[styles.statusIndicator, styles.disconnected]} />
            <Text style={styles.statusText}>Not connected</Text>
          </View>
        )}

        {/* Data Display */}
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Received Data:</Text>
          <View style={styles.dataValueContainer}>
            <Text style={styles.dataValue}>{dataReceived}</Text>
          </View>
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonGroup}>
          {!isScanning ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={scanForPeripherals}
            >
              <Text style={styles.buttonText}>Scan Devices</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={stopScanning}
            >
              <Text style={styles.buttonText}>Stop Scan</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => {
              showDevicesWithoutName = !showDevicesWithoutName;
              setAllDevices([...allDevices]);
            }}
          >
            <Text style={styles.outlineButtonText}>
              {showDevicesWithoutName ? "Hide Nameless" : "Show Nameless"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Device List */}
        <Text style={styles.sectionTitle}>Available Devices</Text>
        {isScanning && allDevices.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Scanning for devices...</Text>
          </View>
        )}

        {allDevices.length === 0 && !isScanning ? (
          <Text style={styles.emptyText}>
            No devices found. Press "Scan Devices" to start.
          </Text>
        ) : (
          <View style={styles.deviceList}>
            {allDevices.map((device) => {
              if (showDevicesWithoutName || device.name) {
                return (
                  <View key={device.id} style={styles.deviceCard}>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>
                        {device.name || "Unnamed Device"}
                      </Text>
                      <Text style={styles.deviceId}>{device.id}</Text>
                    </View>
                    {connectedDevice?.id === device.id ? (
                      <TouchableOpacity
                        style={[styles.deviceButton, styles.disconnectButton]}
                        onPress={disconnectDevice}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.deviceButtonText}>
                            Disconnect
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.deviceButton, styles.connectButton]}
                        onPress={() => connectToDevice(device)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.deviceButtonText}>Connect</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }
              return null;
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
