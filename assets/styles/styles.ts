import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E17",
  },

  // Device List Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#0F172A",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E2E8F0",
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "#1E293B",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#5E7BC7",
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
    color: "#94A3B8",
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
  },
  emptyText: {
    fontSize: 18,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
  deviceList: {
    flex: 1,
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
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2C3A58",
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
    color: "#E2E8F0",
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "monospace",
  },
  scanButtons: {
    padding: 16,
    backgroundColor: "#0F172A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  scanButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5E7BC7",
    padding: 16,
    borderRadius: 12,
  },
  stopScanButton: {
    backgroundColor: "#DC2626",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },

  // Chat Styles
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
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
    color: "#E2E8F0",
    marginBottom: 4,
  },
  peripheralAddress: {
    fontSize: 12,
    color: "#5E7BC7",
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
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  connectionStatusText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#0A0E17",
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
    marginBottom: 20,
    opacity: 0.7,
  },
  emptyChatText: {
    fontSize: 18,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
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
    backgroundColor: "#5E7BC7",
    borderTopRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 4,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#0F172A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1E293B",
    color: "#E2E8F0",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    marginRight: 12,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#5E7BC7",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#1E293B",
  },
});
