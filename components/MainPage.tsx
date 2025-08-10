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
  Alert,
  Modal,
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

const CORRECT_PIN = "1234";

export default function MainPage() {
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<
    {
      type: "sent" | "received" | "request" | "address" | "acknowledgment";
      amount?: string;
      address?: string;
      timestamp: string;
      status: "pending" | "completed" | "failed";
    }[]
  >([]);
  const [showDeviceList, setShowDeviceList] = useState(true);
  const [showDevicesWithoutName, setShowDevicesWithoutName] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [senderBalance, setSenderBalance] = useState(1000); // Starting balance $1000
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "requesting" | "sending" | "completed" | "failed"
  >("idle");

  // PIN verification states
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pendingPaymentAmount, setPendingPaymentAmount] = useState("");

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

  const onDataUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log("onDataUpdate error:", error.message);
      if (error.message.includes("disconnected")) {
        console.log("Device disconnected, stopping monitoring");
        return;
      }
      return;
    }

    if (!characteristic?.value) {
      console.log("onDataUpdate: no characteristic value");
      return;
    }

    try {
      const decodedString = Base64.decode(characteristic.value);
      const receivedText = decodedString;

      console.log(
        "Received data:",
        receivedText,
        "Length:",
        receivedText.length
      );

      // Handle different types of messages
      if (receivedText.startsWith("PAYMENT_REQUEST:")) {
        // Receiver is requesting payment
        const amount = receivedText.split(":")[1];
        handlePaymentRequest(amount);
      } else if (receivedText.startsWith("ADDRESS:")) {
        // Receiver sent their address
        const address = receivedText.split(":")[1];
        setReceiverAddress(address);
        addTransaction("address", undefined, address, "completed");
        console.log("✅ Received receiver address:", address);
      } else if (receivedText.startsWith("PAYMENT_SENT:")) {
        // Payment was sent successfully
        const amount = receivedText.split(":")[1];
        handlePaymentSent(amount);
      } else if (receivedText.startsWith("ACKNOWLEDGMENT:")) {
        // Payment acknowledgment received
        const status = receivedText.split(":")[1];
        handlePaymentAcknowledgment(status);
      } else {
        // Regular message
        addTransaction("received", undefined, receivedText, "completed");
      }
    } catch (e) {
      console.error("Error processing received data:", e);
    }
  };

  const handlePaymentRequest = (amount: string) => {
    addTransaction("request", amount, undefined, "pending");
    setPaymentStatus("requesting");
    Alert.alert(
      "Payment Request",
      `Receiver is requesting $${amount}. Do you want to proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Payment", onPress: () => sendPaymentRequest(amount) },
      ]
    );
  };

  const handlePaymentSent = (amount: string) => {
    const numAmount = parseFloat(amount);
    setSenderBalance((prev) => prev - numAmount);
    addTransaction("sent", amount, undefined, "completed");
    setPaymentStatus("completed");
  };

  const handlePaymentAcknowledgment = (status: string) => {
    addTransaction(
      "acknowledgment",
      undefined,
      `Payment ${status}`,
      "completed"
    );
    if (status === "received") {
      Alert.alert("Success", "Payment received by receiver!");
    }
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

  async function connectToDevice(device: Device) {
    setIsConnecting(true);
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);

      // Important: Discover services and characteristics
      await deviceConnection.discoverAllServicesAndCharacteristics();

      // Enable notifications
      await deviceConnection.monitorCharacteristicForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID,
        onDataUpdate,
        "monitorTransaction"
      );

      stopScanning();
      setShowDeviceList(false);
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
      setTransactionHistory([]);
      setReceiverAddress("");
      setPaymentStatus("idle");
    }
  }

  async function sendPaymentRequest(amount: string) {
    if (!connectedDevice || !amount.trim()) return;

    try {
      const message = `PAYMENT_REQUEST:${amount}`;
      const base64Value = Base64.encode(message);
      await connectedDevice.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Value
      );

      addTransaction("sent", amount, undefined, "pending");
      setPaymentStatus("sending");
    } catch (e) {
      console.error("Send payment request error:", e);
      setPaymentStatus("failed");
    }
  }

  async function sendPayment(amount: string) {
    if (!connectedDevice || !amount.trim()) return;

    // Store the payment amount and show PIN modal
    setPendingPaymentAmount(amount);
    setShowPinModal(true);
    setPinInput("");
    setPinError("");
  }

  const verifyPin = () => {
    if (pinInput === CORRECT_PIN) {
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
      // Proceed with the actual payment
      executePayment(pendingPaymentAmount);
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPinInput("");
    }
  };

  const executePayment = async (amount: string) => {
    if (!connectedDevice || !amount.trim()) return;

    try {
      const message = `PAYMENT_SENT:${amount}`;
      const base64Value = Base64.encode(message);
      await connectedDevice.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        CHARACTERISTIC_UUID,
        base64Value
      );

      const numAmount = parseFloat(amount);
      setSenderBalance((prev) => prev - numAmount);
      addTransaction("sent", amount, undefined, "completed");
      setPaymentStatus("completed");
      setPaymentAmount("");
    } catch (e) {
      console.error("Send payment error:", e);
      setPaymentStatus("failed");
    }
  };

  const cancelPinVerification = () => {
    setShowPinModal(false);
    setPinInput("");
    setPinError("");
    setPendingPaymentAmount("");
  };

  const renderDeviceList = () => (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Receivers</Text>
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
          <Text style={styles.loadingText}>Scanning for receivers...</Text>
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
          <Text style={styles.emptyText}>No receivers found</Text>
          <Text style={styles.emptySubtext}>
            Press the scan button to search for nearby payment receivers
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
                  {device.name || "Unnamed Receiver"}
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
            <Text style={styles.scanButtonText}>Scan Receivers</Text>
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

  const renderPayment = () => (
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
            {connectedDevice?.name || "Payment Receiver"}
          </Text>
          {receiverAddress && (
            <Text style={styles.peripheralAddress} numberOfLines={1}>
              Address: {receiverAddress}
            </Text>
          )}
          <View style={styles.connectionStatus}>
            <View style={styles.connectedIndicator} />
            <Text style={styles.connectionStatusText}>Connected</Text>
          </View>
        </View>
      </View>

      {/* Balance Display */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceAmount}>${senderBalance.toFixed(2)}</Text>
      </View>

      {/* Payment Input */}
      <View style={styles.paymentInputContainer}>
        <Text style={styles.paymentLabel}>Payment Amount ($)</Text>
        <TextInput
          style={styles.paymentInput}
          placeholder="Enter amount..."
          placeholderTextColor="#888"
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          keyboardType="numeric"
          editable={!!connectedDevice}
        />
        <TouchableOpacity
          style={[
            styles.sendPaymentButton,
            (!paymentAmount.trim() || parseFloat(paymentAmount) <= 0) &&
              styles.sendButtonDisabled,
          ]}
          onPress={() => sendPayment(paymentAmount)}
          disabled={!paymentAmount.trim() || parseFloat(paymentAmount) <= 0}
        >
          <MaterialIcons
            name="send"
            size={24}
            color={
              paymentAmount.trim() && parseFloat(paymentAmount) > 0
                ? "white"
                : "#aaa"
            }
          />
          <Text style={styles.sendPaymentButtonText}>Send Payment</Text>
        </TouchableOpacity>
      </View>

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
                Start making payments to see transaction history
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
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {showDeviceList ? renderDeviceList() : renderPayment()}

      {/* PIN Verification Modal */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelPinVerification}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PIN Verification</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="Enter PIN"
              placeholderTextColor="#888"
              value={pinInput}
              onChangeText={setPinInput}
              keyboardType="numeric"
              secureTextEntry
            />
            {pinError ? <Text style={styles.pinError}>{pinError}</Text> : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={verifyPin}>
                <Text style={styles.modalButtonText}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={cancelPinVerification}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
