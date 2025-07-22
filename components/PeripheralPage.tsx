import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Platform } from "react-native";
import { BleManager } from "react-native-ble-plx";
import { Buffer } from "buffer";

const bleManager = new BleManager();

export default function PeripheralPage() {
  const [error, setError] = useState<string | null>(null); // Add type definition
  const [isAdvertising, setIsAdvertising] = useState(false);

  // Service UUIDs (must match your Central)
  const SERVICE_UUID = "9800";
  const CHARACTERISTIC_UUID = "9801";

  // Start Advertising (Android only)
  const startAdvertising = async () => {
    if (Platform.OS !== "android") {
      setError("Peripheral mode only works on Android");
      return;
    }

    try {
      await bleManager.startAdvertising({
        serviceUUIDs: [SERVICE_UUID],
        localName: "MyReactPeripheral",
        options: {
          advertiseMode: 1, // ADVERTISE_MODE_LOW_LATENCY
          txPowerLevel: 3, // HIGH
          connectable: true,
        },
      });
      setIsAdvertising(true);
    } catch (err) {
      setError(`Failed to advertise: ${err.message}`);
    }
  };

  // Stop Advertising
  const stopAdvertising = async () => {
    try {
      await bleManager.stopAdvertising();
      setIsAdvertising(false);
    } catch (err) {
      setError(`Failed to stop advertising: ${err.message}`);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (isAdvertising) stopAdvertising();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Peripheral Mode {isAdvertising ? "(Active)" : ""}</Text>

      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <Button
        title={isAdvertising ? "Stop Advertising" : "Start Advertising"}
        onPress={isAdvertising ? stopAdvertising : startAdvertising}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});
