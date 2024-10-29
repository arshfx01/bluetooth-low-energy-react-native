import React from "react";
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import styles from "../assets/styles/styles";
import ParallaxScrollView from "./ParallaxScrollView";

export const bleManager = new BleManager();
let showDevicesWithoutName = false;

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  // Managers Central Mode - Scanning for devices
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;
  function scanForPeripherals() {
    console.log("Scanning for peripherals...");
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
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

  // Managers Central Mode - Connecting to a device
  async function connectToDevice(device: Device) {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      //startStreamingData(deviceConnection);
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  }

  return (
    <>
      <ParallaxScrollView>
        <Text style={styles.textTitle}>Central Mode</Text>
        <Text style={styles.textTitle}>Listing Devices</Text>
        <View style={styles.containerButtons}>
          <Button title="Start" onPress={scanForPeripherals} />
          {/* TODO: Implement this button
        <Button
          title="Stop"
          onPress={() => {
            console.log("Stop Scanning");
            bleManager.stopDeviceScan;
          }}
        /> */}
          <Button title="Clear" onPress={() => setAllDevices([])}></Button>
          <Button
            title={showDevicesWithoutName ? "Hide Nameless" : "Show Nameless"}
            onPress={() => {
              showDevicesWithoutName = !showDevicesWithoutName;
              setAllDevices([...allDevices]);
              console.warn("Showing Devices Nameless: ", showDevicesWithoutName);
            }}></Button>
        </View>
        <View style={styles.containerDevices}>
          {allDevices.map((device) => {
            if (showDevicesWithoutName || device.name) {
              return (
                <React.Fragment key={device.id}>
                  <Text>
                    📲 - {device.id} - {device.name}
                  </Text>
                  <Button
                    key={`button${device.id}`}
                    title="Connect"
                    onPress={() => connectToDevice(device)}
                  />
                </React.Fragment>
              );
            }
            return null;
          })}
        </View>
      </ParallaxScrollView>
      {connectedDevice && (
        <View style={styles.containerConnectedDevice}>
          <Text>Connected Device</Text>
          <View style={styles.containerDevices}></View>
        </View>
      )}
    </>
  );
}
