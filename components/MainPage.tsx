import react from "react";
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { BleManager } from "react-native-ble-plx";
import styles from "../assets/styles/styles";
import { Collapsible } from "./Collapsible";
import { ScrollView } from "react-native-gesture-handler";
import ParallaxScrollView from "./ParallaxScrollView";

export const bleManager = new BleManager();

// Device Interface
// TODO: Identify the correct type for this
interface Device {
  id: string;
  name: string;
}

let showDevicesWithoutName = false;

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  // Managers Central Mode
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  function scanForPeripherals() {
    console.log("Scanning for peripherals...");
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
      }

      // TODO: Create a input for filter the devices

      if (device) {
        if (!showDevicesWithoutName && !device.name) {
          return;
        }
        //console.warn("Device found! Data: ", device.id, " - ", device.name);
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
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
              setAllDevices([]);
              scanForPeripherals();
            }}></Button>
        </View>
        <View style={styles.containerDevices}>
          {allDevices.map((device) => (
            <>
              <Text key={device.id}>
                📲 - {device.id} - {device.name}
              </Text>
              <Button key={`button${device.id}`} title="Connect"></Button>
            </>
          ))}
        </View>
      </ParallaxScrollView>
      {connectedDevice && (
        <View style={styles.containerConnectedDevice}>
          <Text>Device Infos</Text>
        </View>
      )}
    </>
  );
}
