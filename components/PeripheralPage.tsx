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
  Alert,
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
  const [transactionHistory, setTransactionHistory] = useState<
    {
      type: "sent" | "received" | "request" | "address" | "acknowledgment";
      amount?: string;
      address?: string;
      timestamp: string;
      status: "pending" | "completed" | "failed";
    }[]
  >([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [peripheralAddress, setPeripheralAddress] = useState<string>("");
  const [addressSent, setAddressSent] = useState(false);
  const [receiverBalance, setReceiverBalance] = useState(500); // Starting balance $500
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "waiting" | "received" | "failed"
  >("idle");

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
    console.log(`[BLE Receiver] ${message}`);
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setLogs((prev) => [
      `${time}: ${message}`,
      ...prev.slice(0, 19), // Keep last 20 logs
    ]);
  };

  const addTransaction = (
    type: "sent" | "received" | "request" | "address" | "acknowledgment",
    amount?: string,
    address?: string,
    status: "pending" | "completed" | "failed" = "completed"
  ) => {
    setTransactionHistory((prev) => [
      {
        type,
        amount,
        address,
        timestamp: new Date().toLocaleTimeString(),
        status,
      },
      ...prev.slice(0, 49), // Keep last 50 transactions
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

      await BlePeripheral.setName("BLE Payment Receiver");
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
        addLog("Now advertising as BLE payment receiver");
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

        console.log("Received message:", str);

        // Handle different types of messages
        if (str.startsWith("PAYMENT_REQUEST:")) {
          // Sender is requesting to send payment
          const amount = str.split(":")[1];
          handlePaymentRequest(amount);
        } else if (str.startsWith("PAYMENT_SENT:")) {
          // Payment was sent successfully
          const amount = str.split(":")[1];
          handlePaymentReceived(amount);
        } else {
          // Regular message
          addTransaction("received", undefined, str, "completed");
        }

        addLog(`Received message: ${str}`);

        // Send receiver address as notification when we receive first message
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

  const handlePaymentRequest = (amount: string) => {
    addTransaction("request", amount, undefined, "pending");
    setPaymentStatus("waiting");
    Alert.alert(
      "Payment Request",
      `Sender wants to send $${amount}. Accept payment?`,
      [
        { text: "Decline", style: "cancel" },
        { text: "Accept", onPress: () => acceptPayment(amount) },
      ]
    );
  };

  const handlePaymentReceived = (amount: string) => {
    const numAmount = parseFloat(amount);
    setReceiverBalance((prev) => prev + numAmount);
    addTransaction("received", amount, undefined, "completed");
    setPaymentStatus("received");

    // Send acknowledgment
    setTimeout(async () => {
      try {
        const ackMessage = "ACKNOWLEDGMENT:received";
        const ackBytes = Array.from(ackMessage, (char) => char.charCodeAt(0));
        await BlePeripheral.sendNotificationToDevices(
          SERVICE_UUID,
          CHARACTERISTIC_UUID,
          ackBytes
        );
        addLog("Sent payment acknowledgment");
      } catch (error) {
        addLog("Failed to send acknowledgment");
      }
    }, 1000);
  };

  const acceptPayment = async (amount: string) => {
    try {
      const message = `PAYMENT_ACCEPTED:${amount}`;
      const messageBytes = Array.from(message, (char) => char.charCodeAt(0));
      await BlePeripheral.sendNotificationToDevices(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        messageBytes
      );
      addTransaction("acknowledgment", amount, "Payment accepted", "completed");
      setPaymentStatus("waiting");
    } catch (error) {
      addLog("Failed to send payment acceptance");
      setPaymentStatus("failed");
    }
  };

  return (
    <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="bluetooth" size={28} color="#5E7BC7" />
          <Text style={styles.headerTitle}>Payment Receiver</Text>
        </View>
        <Text style={styles.headerSub}>BLE Payment Demo</Text>
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
              {isAdvertising ? "Ready to Receive" : "Not Advertising"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isAdvertising
                ? "Waiting for payments..."
                : "Press start to begin"}
            </Text>
          </View>
        </View>

        {/* Receiver Address Display */}
        {peripheralAddress && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Receiver Address:</Text>
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
          <Text style={styles.statusDeviceName}>BLE Payment Receiver</Text>
        </View>
      </View>

      {/* Balance Display */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>${receiverBalance.toFixed(2)}</Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorCard}>
          <MaterialIcons name="error-outline" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Transaction History */}
      <View style={styles.transactionContainer}>
        <Text style={styles.transactionTitle}>Transaction History</Text>
        <ScrollView style={styles.transactionList}>
          {transactionHistory.length === 0 ? (
            <View style={styles.emptyTransaction}>
              <Feather
                name="credit-card"
                size={48}
                color="#5E7BC7"
                style={styles.emptyTransactionIcon}
              />
              <Text style={styles.emptyTransactionText}>
                No transactions yet
              </Text>
              <Text style={styles.emptyTransactionSubtext}>
                Start receiving payments to see transaction history
              </Text>
            </View>
          ) : (
            transactionHistory.map((txn, idx) => (
              <View key={idx} style={styles.transactionItem}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionType}>
                    {txn.type === "sent"
                      ? "💰 Sent"
                      : txn.type === "received"
                      ? "💳 Received"
                      : txn.type === "request"
                      ? "📤 Request"
                      : txn.type === "address"
                      ? "📍 Address"
                      : "✅ Acknowledgment"}
                  </Text>
                  <Text style={styles.transactionTime}>{txn.timestamp}</Text>
                </View>
                {txn.amount && (
                  <Text style={styles.transactionAmount}>${txn.amount}</Text>
                )}
                {txn.address && (
                  <Text style={styles.transactionAddress}>{txn.address}</Text>
                )}
                <View
                  style={[
                    styles.statusIndicator,
                    txn.status === "completed" && styles.statusCompleted,
                    txn.status === "pending" && styles.statusPending,
                    txn.status === "failed" && styles.statusFailed,
                  ]}
                >
                  <Text style={styles.statusText}>{txn.status}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlButtons}>
        {!isAdvertising ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={startAdvertising}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="play-arrow" size={24} color="white" />
            )}
            <Text style={styles.controlButtonText}>
              {isLoading ? "Starting..." : "Start Receiving"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={stopAdvertising}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialIcons name="stop" size={24} color="white" />
            )}
            <Text style={styles.controlButtonText}>
              {isLoading ? "Stopping..." : "Stop Receiving"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logs Section */}
      {logs.length > 0 && (
        <View style={styles.logsContainer}>
          <TouchableOpacity
            style={styles.logsHeader}
            onPress={() => setLogsVisible(!logsVisible)}
          >
            <Text style={styles.logsTitle}>Debug Logs</Text>
            <MaterialIcons
              name={logsVisible ? "expand-less" : "expand-more"}
              size={24}
              color="#94A3B8"
            />
          </TouchableOpacity>
          {logsVisible && (
            <ScrollView style={styles.logsContent}>
              {logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 16,
  },

  // Header Styles
  header: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#212529",
    marginLeft: 12,
  },
  headerSub: {
    fontSize: 14,
    color: "#868E96",
  },

  // Status Card
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statusCardActive: {
    borderColor: "#4263EB",
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
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusIconActive: {
    backgroundColor: "rgba(66, 99, 235, 0.1)",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#868E96",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: "#40C057",
  },
  statusDotInactive: {
    backgroundColor: "#ADB5BD",
  },
  statusDeviceName: {
    fontSize: 14,
    color: "#868E96",
  },

  // Balance Card
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#868E96",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#40C057",
  },

  // Error Card
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F03E3E",
  },
  errorText: {
    color: "#F03E3E",
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },

  // Transaction History
  transactionContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 12,
  },
  transactionList: {
    maxHeight: 200,
  },
  transactionItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4263EB",
  },
  transactionTime: {
    fontSize: 12,
    color: "#868E96",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#40C057",
    marginTop: 4,
  },
  transactionAddress: {
    fontSize: 14,
    color: "#868E96",
    marginTop: 4,
  },

  statusCompleted: {
    backgroundColor: "#D3F9D8",
  },
  statusPending: {
    backgroundColor: "#FFF3BF",
  },
  statusFailed: {
    backgroundColor: "#FFE3E3",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#212529",
  },
  emptyTransaction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTransactionIcon: {
    marginBottom: 16,
    opacity: 0.7,
    color: "#4263EB",
  },
  emptyTransactionText: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "600",
    marginBottom: 4,
  },
  emptyTransactionSubtext: {
    fontSize: 14,
    color: "#868E96",
    textAlign: "center",
  },

  // Control Buttons
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  controlButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: "#4263EB",
    shadowColor: "#4263EB",
  },
  stopButton: {
    backgroundColor: "#F03E3E",
    shadowColor: "#F03E3E",
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
  logsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  logsContent: {
    maxHeight: 200,
    marginTop: 8,
  },
  logText: {
    color: "#868E96",
    fontSize: 12,
    fontFamily: Platform.OS === "android" ? "monospace" : "Courier New",
    paddingVertical: 4,
  },
  emptyLogText: {
    color: "#868E96",
    fontSize: 14,
    textAlign: "center",
    padding: 16,
  },

  // Address Display
  addressContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  addressLabel: {
    fontSize: 14,
    color: "#868E96",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4263EB",
    fontFamily: "monospace",
  },
});
