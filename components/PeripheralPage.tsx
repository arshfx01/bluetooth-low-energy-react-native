import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Platform,
  TextInput,
} from "react-native";
import { Buffer } from "buffer";
import BlePeripheral from "react-native-ble-peripheral";

export default function PeripheralPage() {
  const [error, setError] = useState<string | null>(null);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [lastSent, setLastSent] = useState<string | null>(null);

  // Service/Characteristic UUIDs (must match central)
  const SERVICE_UUID = "9800";
  const CHARACTERISTIC_UUID = "9801";

  // Setup BLE Peripheral
  const setupPeripheral = async () => {
    try {
      await BlePeripheral.removeAllServices();
      await BlePeripheral.addService(SERVICE_UUID, true);
      await BlePeripheral.addCharacteristicToService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        32, // Permission: Write Encrypted
        2 | 8 | 16 // Properties: Read | Write | Notify
      );
      await BlePeripheral.setName("MyReactPeripheral");
    } catch (err: any) {
      setError(`Peripheral setup failed: ${err?.message || err}`);
    }
  };

  // Start Advertising (Android only)
  const startAdvertising = async () => {
    if (Platform.OS !== "android") {
      setError("Peripheral mode only works on Android");
      return;
    }
    setError(null);
    try {
      await setupPeripheral();
      await BlePeripheral.startAdvertising();
      setIsAdvertising(true);
    } catch (err: any) {
      setError(`Failed to advertise: ${err?.message || err}`);
    }
  };

  // Stop Advertising
  const stopAdvertising = async () => {
    try {
      await BlePeripheral.stopAdvertising();
      setIsAdvertising(false);
    } catch (err: any) {
      setError(`Failed to stop advertising: ${err?.message || err}`);
    }
  };

  // Send notification to centrals
  const sendNotification = async () => {
    try {
      const base64Value = Buffer.from(inputValue).toString("base64");
      await BlePeripheral.sendNotificationToDevice(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Value
      );
      setLastSent(inputValue);
      setInputValue("");
    } catch (err: any) {
      setError(`Failed to send notification: ${err?.message || err}`);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (isAdvertising) stopAdvertising();
      BlePeripheral.removeAllServices();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <Text>Peripheral Mode {isAdvertising ? "(Active)" : ""}</Text>
      {error && <Text style={{ color: "red" }}>{error}</Text>}
      <Button
        title={isAdvertising ? "Stop Advertising" : "Start Advertising"}
        onPress={isAdvertising ? stopAdvertising : startAdvertising}
      />
      {isAdvertising && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Type message to send"
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Button
            title="Send Notification"
            onPress={sendNotification}
            disabled={!inputValue}
          />
          {lastSent && <Text>Last sent: {lastSent}</Text>}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
});
