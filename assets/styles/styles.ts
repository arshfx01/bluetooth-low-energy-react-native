import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Device List Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#E9ECEF",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#4263EB",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: "#868E96",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.7,
    color: "#4263EB",
  },
  emptyText: {
    fontSize: 18,
    color: "#212529",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#868E96",
    textAlign: "center",
    lineHeight: 20,
  },
  deviceList: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  deviceListContent: {
    paddingBottom: 20,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  deviceIcon: {
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: "#868E96",
    fontFamily: "monospace",
  },
  scanButtons: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
  },
  scanButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4263EB",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#4263EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  stopScanButton: {
    backgroundColor: "#F03E3E",
    shadowColor: "#F03E3E",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },

  // Chat Header Styles
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  backButton: {
    marginRight: 16,
  },
  deviceInfoHeader: {
    flex: 1,
  },
  deviceNameHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 4,
  },
  peripheralAddress: {
    fontSize: 12,
    color: "#4263EB",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#40C057",
    marginRight: 8,
  },
  connectionStatusText: {
    fontSize: 14,
    color: "#868E96",
  },

  // Balance Card
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#868E96",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#40C057",
  },

  // Payment Input
  paymentInputContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 12,
  },
  paymentInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#212529",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  sendPaymentButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4263EB",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#4263EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendPaymentButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
    backgroundColor: "#ADB5BD",
    shadowColor: "#ADB5BD",
  },

  // Transaction History
  transactionContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  transactionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
  },
  transactionList: {
    flex: 1,
  },
  emptyTransaction: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTransactionIcon: {
    marginBottom: 20,
    opacity: 0.7,
    color: "#4263EB",
  },
  emptyTransactionText: {
    fontSize: 18,
    color: "#212529",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyTransactionSubtext: {
    fontSize: 14,
    color: "#868E96",
    textAlign: "center",
  },
  transactionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
  },
  transactionTime: {
    fontSize: 12,
    color: "#868E96",
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#40C057",
    marginBottom: 4,
  },
  transactionAddress: {
    fontSize: 12,
    color: "#4263EB",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  statusIndicator: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#E9ECEF",
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

  // PIN Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "80%",
    maxWidth: 300,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center",
    marginBottom: 20,
  },
  pinInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: "#212529",
    textAlign: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  pinError: {
    color: "#F03E3E",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#4263EB",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: "#4263EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Message Bubbles (for any chat functionality)
  messageContainer: {
    marginBottom: 12,
  },
  sentMessage: {
    alignItems: "flex-end",
  },
  receivedMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
  },
  sentBubble: {
    backgroundColor: "#4263EB",
    borderTopRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: "#E9ECEF",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 22,
  },
  receivedMessageText: {
    color: "#212529",
  },
  messageTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  receivedMessageTime: {
    color: "rgba(0,0,0,0.5)",
  },
});
