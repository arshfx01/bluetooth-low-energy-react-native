import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import { Buffer } from "buffer";
import BlePeripheral from "react-native-ble-peripheral";
import { requestBluetoothAdvertisePermission } from "../hooks/useBLE";

export default function PeripheralPage() {
  const [error, setError] = useState<string | null>(null);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [lastReceived, setLastReceived] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Service/Characteristic UUIDs (must match central)
  const SERVICE_UUID = "00009800-0000-1000-8000-00805f9b34fb";
  const CHARACTERISTIC_UUID = "00009801-0000-1000-8000-00805f9b34fb";

  const addLog = (message: string) => {
    console.log(`[BLE Peripheral] ${message}`);
    setLogs((prev) => [
      `${new Date().toLocaleTimeString()}: ${message}`,
      ...prev.slice(0, 9),
    ]);
  };

  // Setup BLE Peripheral
  const setupPeripheral = async () => {
    try {
      addLog("Setting up BLE service...");
      await BlePeripheral.addService(SERVICE_UUID, true);
      await BlePeripheral.addCharacteristicToService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        32, // Permission: Write Encrypted
        2 | 8 | 16 // Properties: Read | Write | Notify
      );
      await BlePeripheral.setName("MyReactPeripheral");
      addLog("BLE service setup complete");
    } catch (err: any) {
      const errorMsg = `Peripheral setup failed: ${err?.message || err}`;
      addLog(errorMsg);
      setError(errorMsg);
      throw err;
    }
  };

  // Start Advertising (Android only)
  const startAdvertising = async () => {
    if (Platform.OS !== "android") {
      const errorMsg = "Peripheral mode only works on Android";
      addLog(errorMsg);
      setError(errorMsg);
      return;
    }

    // Request runtime permission for Android 12+
    const hasAdvertisePermission = await requestBluetoothAdvertisePermission();
    if (!hasAdvertisePermission) {
      const errorMsg = "Bluetooth Advertise permission denied";
      addLog(errorMsg);
      setError(errorMsg);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      addLog("Starting advertising...");
      await setupPeripheral();
      await BlePeripheral.start();
      setIsAdvertising(true);
      addLog("Now advertising as BLE peripheral");
    } catch (err: any) {
      const errorMsg = `Failed to advertise: ${err?.message || err}`;
      addLog(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Stop Advertising
  const stopAdvertising = async () => {
    setIsLoading(true);
    try {
      addLog("Stopping advertising...");
      await BlePeripheral.stop();
      setIsAdvertising(false);
      addLog("Advertising stopped");
    } catch (err: any) {
      const errorMsg = `Failed to stop advertising: ${err?.message || err}`;
      addLog(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for characteristic write requests from central (if possible)
  // This library does not provide a JS event, but we can poll or log a placeholder
  // If you want to show a message, you can update this state from native code if you extend the library

  // Cleanup
  useEffect(() => {
    // Listen for central write events
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEPeripheral);
    const subscription = eventEmitter.addListener("onCentralWrite", (event) => {
      if (event && event.data) {
        // Convert int array to string (assuming UTF-8)
        const bytes = event.data;
        let str = "";
        try {
          str = String.fromCharCode(...bytes);
        } catch (e) {
          str = bytes.join(",");
        }
        setLastReceived(str);
        addLog(`Received from central: ${str}`);
      }
    });
    return () => {
      if (isAdvertising) {
        addLog("Component unmounting - cleaning up...");
        stopAdvertising();
      }
      subscription.remove();
    };
  }, [isAdvertising]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Peripheral Mode</Text>

      {/* Status Indicator */}
      <View
        style={[
          styles.statusContainer,
          isAdvertising ? styles.statusActive : styles.statusInactive,
        ]}
      >
        <View
          style={[
            styles.statusDot,
            isAdvertising ? styles.statusDotActive : styles.statusDotInactive,
          ]}
        />
        <Text style={styles.statusText}>
          {isAdvertising
            ? "Advertising as MyReactPeripheral"
            : "Not Advertising"}
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            isAdvertising ? styles.stopButton : styles.startButton,
            isLoading && styles.buttonDisabled,
          ]}
          onPress={isAdvertising ? stopAdvertising : startAdvertising}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isAdvertising ? "STOP ADVERTISING" : "START ADVERTISING"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Data Sending Section */}
      {isAdvertising && (
        <View style={styles.dataSection}>
          {/* Show last message received from central */}
          {lastReceived && (
            <View style={styles.lastSentContainer}>
              <Text style={styles.lastSentLabel}>
                Last message from central:
              </Text>
              <Text style={styles.lastSentValue}>{lastReceived}</Text>
            </View>
          )}
        </View>
      )}

      {/* Debug Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Activity Log:</Text>
        <ScrollView style={styles.logsScrollView}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>
              {log}
            </Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#1E1E1E",
  },
  statusActive: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  statusInactive: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusDotActive: {
    backgroundColor: "#4CAF50",
  },
  statusDotInactive: {
    backgroundColor: "#F44336",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#2D0000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF5555",
  },
  buttonGroup: {
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  startButton: {
    backgroundColor: "#1E3A8A",
  },
  stopButton: {
    backgroundColor: "#7F1D1D",
  },
  dataSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  lastSentContainer: {
    backgroundColor: "#1A1A1A",
    padding: 12,
    borderRadius: 8,
  },
  lastSentLabel: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 4,
  },
  lastSentValue: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  logsContainer: {
    flex: 1,
    marginTop: 12,
  },
  logsTitle: {
    color: "#AAAAAA",
    fontSize: 16,
    marginBottom: 8,
  },
  logsScrollView: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    padding: 12,
  },
  logText: {
    color: "#CCCCCC",
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === "android" ? "monospace" : "Courier New",
  },
});
