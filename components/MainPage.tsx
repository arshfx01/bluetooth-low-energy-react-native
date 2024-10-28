import react from "react";
import { useState } from "react";
import { Button, Text, View } from "react-native";
import { BleManager } from "react-native-ble-plx";
import styles from "../assets/styles/styles";
import { Collapsible } from "./Collapsible";

export const bleManager = new BleManager();

// Device Interface
// TODO: Identify the correct type for this
interface Device {
  id: string;
  name: string;
}

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);

  // Managers Central Mode
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () => console.log("Scanning for peripherals...");
  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.error(error);
    }

    // TODO: Create a input to change this "dispositivo" for any other name, for filter the devices
    // TODO: if (device && (device.localName === "Dispositivo" || device.name === "Dispositivo")) {

    if (device) {
      console.warn("Device found! Data: ", device.id, " - ", device.name);
      setAllDevices((prevState: Device[]) => {
        if (!isDuplicteDevice(prevState, device)) {
          return [...prevState, device];
        }
        return prevState;
      });
    }
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "start",
        alignItems: "center",
        padding: 24,
      }}>
      <Text>Bluetooh Low Energy + React Native</Text>
      <Text>Central Mode - Listing Devices</Text>
      <Button title="Clear Devices list" onPress={() => setAllDevices([])}></Button>
      <Button title="Start Scanning" onPress={scanForPeripherals} />
      <Button
        title="Stop Scanning"
        onPress={() => {
          console.log("Stop Scanning");
          bleManager.stopDeviceScan();
        }}
      />
      <Text>Devices</Text>
      <View style={styles.containerDevices}>
        <Collapsible title="Devices">
          {allDevices.map((device) => (
            <Text key={device.id}>
              {device.id} - {device.name}
            </Text>
          ))}
        </Collapsible>
      </View>
    </View>
  );
}
