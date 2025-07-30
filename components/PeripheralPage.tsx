import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  NativeEventEmitter,
  NativeModules,
  LayoutAnimation,
  Animated,
  Easing,
  UIManager,
} from "react-native";
import { Buffer } from "buffer";
import BlePeripheral from "react-native-ble-peripheral";
import { requestBluetoothAdvertisePermission } from "../hooks/useBLE";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Generate random Ethereum-style address
const generateEthereumAddress = (): string => {
  const chars = "0123456789abcdef";
  let address = "0x";
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

export default function PeripheralPage() {
  const [error, setError] = useState<string | null>(null);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [logsVisible, setLogsVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { text: string; timestamp: string; type: "received" | "sent" }[]
  >([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [peripheralAddress, setPeripheralAddress] = useState<string>("");
  const [addressSent, setAddressSent] = useState(false);

  // Service/Characteristic UUIDs (must match central)
  const SERVICE_UUID = "00009800-0000-1000-8000-00805f9b34fb";
  const CHARACTERISTIC_UUID = "00009801-0000-1000-8000-00805f9b34fb";

  // Generate address on component mount
  useEffect(() => {
    setPeripheralAddress(generateEthereumAddress());

    // Check if BlePeripheral module is available
    if (!BlePeripheral) {
      const errorMsg =
        "BlePeripheral module not available - check if device supports BLE advertising";
      setError(errorMsg);
      addLog(errorMsg);
    } else {
      addLog("BlePeripheral module loaded successfully");
    }
  }, []);

  // Animation effects
  useEffect(() => {
    if (isAdvertising) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isAdvertising]);

  const addLog = (message: string) => {
    console.log(`[BLE Peripheral] ${message}`);
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLogs((prev) => [
      `${time}: ${message}`,
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  // Setup BLE Peripheral
  const setupPeripheral = async () => {
    try {
      addLog("Setting up BLE service...");

      // Check if BlePeripheral is available
      if (!BlePeripheral) {
        throw new Error("BlePeripheral module not available");
      }

      await BlePeripheral.addService(SERVICE_UUID, true);

      // Add chat characteristic (read/write/notify)
      await BlePeripheral.addCharacteristicToService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        1 | 16, // Permission: Read + Write
        2 | 8 | 16 // Properties: Read | Write | Notify
      );

      await BlePeripheral.setName("BLE Chat Peripheral");
      addLog(`BLE service setup complete. Address: ${peripheralAddress}`);
    } catch (err: any) {
      const errorMsg = `Setup failed: ${
        err && err.message ? err.message : err
      }`;
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

      // Check if BlePeripheral is available
      if (!BlePeripheral) {
        throw new Error("BlePeripheral module not available");
      }

      // Check if the module has the required methods
      if (typeof BlePeripheral.addService !== "function") {
        throw new Error("BlePeripheral module not properly initialized");
      }

      await setupPeripheral();

      // Add a small delay to ensure setup is complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      addLog("Starting BLE advertising...");
      try {
        await BlePeripheral.start();
        setIsAdvertising(true);
        setAddressSent(false); // Reset flag for new connections
        addLog("Now advertising as BLE peripheral");
      } catch (startError: any) {
        const startErrorMsg = `BLE advertising failed: ${
          startError && startError.message ? startError.message : startError
        }`;
        addLog(startErrorMsg);

        // Check if it's a Bluetooth LE advertiser issue
        if (
          startErrorMsg.includes("null") ||
          startErrorMsg.includes("NullPointerException")
        ) {
          throw new Error(
            "Bluetooth LE advertiser not available. This device may not support BLE advertising or Bluetooth may not be enabled."
          );
        }
        throw startError;
      }
    } catch (err: any) {
      const errorMsg = `Failed to advertise: ${
        err && err.message ? err.message : err
      }`;
      addLog(errorMsg);
      setError(errorMsg);

      // Reset state on error
      setIsAdvertising(false);
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
      const errorMsg = `Failed to stop advertising: ${
        err && err.message ? err.message : err
      }`;
      addLog(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for characteristic write requests from central
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
        setChatHistory((prev) => [
          {
            text: str,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "received",
          },
          ...prev.slice(0, 49), // keep last 50 messages
        ]);
        addLog(`Received message: ${str}`);

        // Send peripheral address as notification when we receive first message
        // This ensures the central is connected and listening
        if (!addressSent) {
          setTimeout(async () => {
            try {
              if (peripheralAddress && isAdvertising) {
                const addressBytes = Array.from(peripheralAddress, (char) =>
                  char.charCodeAt(0)
                );
                await BlePeripheral.sendNotificationToDevices(
                  SERVICE_UUID,
                  CHARACTERISTIC_UUID,
                  addressBytes
                );
                addLog(`Sent address notification: ${peripheralAddress}`);
                setAddressSent(true);
              }
            } catch (notificationError: any) {
              const errorMsg = `Failed to send address notification: ${
                notificationError && notificationError.message
                  ? notificationError.message
                  : notificationError
              }`;
              addLog(errorMsg);
              // Don't throw - just log the error to avoid crashing
            }
          }, 500); // Short delay to ensure connection is stable
        }
      }
    });

    return () => {
      if (isAdvertising) {
        addLog("Cleaning up...");
        stopAdvertising();
      }
      subscription.remove();
    };
  }, [isAdvertising, peripheralAddress]);

  return (
    <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="bluetooth" size={28} color="#5E7BC7" />
          <Text style={styles.headerTitle}>Peripheral Mode</Text>
        </View>
        <Text style={styles.headerSub}>BLE Chat Demo</Text>
      </View>

      {/* Status Card */}
      <View
        style={[styles.statusCard, isAdvertising && styles.statusCardActive]}
      >
        <View style={styles.statusContent}>
          <Animated.View
            style={[
              styles.statusIcon,
              { transform: [{ scale: pulseAnim }] },
              isAdvertising && styles.statusIconActive,
            ]}
          >
            <MaterialIcons
              name={isAdvertising ? "bluetooth-connected" : "bluetooth"}
              size={24}
              color={isAdvertising ? "#5E7BC7" : "#94A3B8"}
            />
          </Animated.View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {isAdvertising ? "Advertising" : "Not Advertising"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isAdvertising
                ? "Waiting for connections..."
                : "Press start to begin"}
            </Text>
          </View>
        </View>

        {/* Peripheral Address Display */}
        {peripheralAddress && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Peripheral ID:</Text>
            <Text style={styles.addressText}>{peripheralAddress}</Text>
          </View>
        )}

        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              isAdvertising ? styles.statusDotActive : styles.statusDotInactive,
            ]}
          />
          <Text style={styles.statusDeviceName}>BLE Chat Peripheral</Text>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>Messages from Central</Text>
          <Text style={styles.chatCount}>{chatHistory.length} received</Text>
        </View>

        <ScrollView
          style={styles.chatScroll}
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
                {isAdvertising
                  ? "Send messages from central device to see them here"
                  : "Start advertising to receive messages"}
              </Text>
            </View>
          ) : (
            [...chatHistory].reverse().map((msg, idx) => (
              <View key={idx} style={styles.messageContainer}>
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>{msg.text}</Text>
                  <Text style={styles.messageTime}>{msg.timestamp}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Control Button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          isAdvertising ? styles.stopButton : styles.startButton,
          isLoading && styles.buttonDisabled,
        ]}
        onPress={isAdvertising ? stopAdvertising : startAdvertising}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <MaterialIcons
              name={isAdvertising ? "stop" : "play-arrow"}
              size={24}
              color="white"
            />
            <Text style={styles.controlButtonText}>
              {isAdvertising ? "STOP ADVERTISING" : "START ADVERTISING"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Debug Logs */}
      <TouchableOpacity
        style={styles.logsToggle}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setLogsVisible(!logsVisible);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.logsToggleText}>
          {logsVisible ? (
            <>
              <Ionicons name="chevron-up" size={16} color="#5E7BC7" />
              Hide Activity Log
            </>
          ) : (
            <>
              <Ionicons name="chevron-down" size={16} color="#5E7BC7" />
              Show Activity Log
            </>
          )}
        </Text>
      </TouchableOpacity>

      {logsVisible && (
        <View style={styles.logsContainer}>
          <ScrollView style={styles.logsScrollView}>
            {logs.length === 0 ? (
              <Text style={styles.emptyLogText}>No activity yet</Text>
            ) : (
              logs.map((log, index) => (
                <View key={index} style={styles.logEntry}>
                  <Text style={styles.logText}>{log}</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E17",
    padding: 16,
  },

  // Header Styles
  header: {
    padding: 16,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#E2E8F0",
    marginLeft: 12,
  },
  headerSub: {
    fontSize: 14,
    color: "#94A3B8",
  },

  // Status Card
  statusCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2C3A58",
  },
  statusCardActive: {
    borderColor: "#3B82F6",
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusIconActive: {
    backgroundColor: "rgba(94, 123, 199, 0.2)",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E2E8F0",
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2C3A58",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: "#10B981",
  },
  statusDotInactive: {
    backgroundColor: "#64748B",
  },
  statusDeviceName: {
    fontSize: 14,
    color: "#94A3B8",
  },

  // Error Card
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D0000",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  errorText: {
    color: "#F87171",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },

  // Chat Container
  chatContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  chatCount: {
    fontSize: 14,
    color: "#5E7BC7",
    fontWeight: "500",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyChatIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyChatText: {
    fontSize: 16,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageBubble: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 12,
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#E2E8F0",
    marginBottom: 4,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },

  // Control Button
  controlButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#1D4ED8",
  },
  stopButton: {
    backgroundColor: "#B91C1C",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  controlButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },

  // Logs Section
  logsToggle: {
    alignItems: "center",
    padding: 8,
    marginBottom: 8,
  },
  logsToggleText: {
    color: "#5E7BC7",
    fontWeight: "500",
    fontSize: 14,
  },
  logsContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    maxHeight: 200,
    padding: 12,
  },
  logsScrollView: {
    flex: 1,
  },
  logEntry: {
    paddingVertical: 4,
  },
  logText: {
    color: "#94A3B8",
    fontSize: 12,
    fontFamily: Platform.OS === "android" ? "monospace" : "Courier New",
  },
  emptyLogText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    padding: 16,
  },

  // New styles for address display
  addressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2C3A58",
  },
  addressLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E2E8F0",
  },
});
