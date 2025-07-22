import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerScreen: {
    flex: 1,
    backgroundColor: "#0A0A0A", // Deep dark background
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  textTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 24,
    letterSpacing: 0.8,
    textShadowColor: "rgba(74, 144, 226, 0.3)", // Subtle glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#E0E0E0",
    marginTop: 24,
    marginBottom: 16,
    paddingLeft: 8,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60", // Accent border
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  connected: {
    backgroundColor: "#27AE60",
    shadowColor: "#27AE60",
    shadowRadius: 6,
    shadowOpacity: 0.3,
  },
  disconnected: {
    backgroundColor: "#E74C3C",
    shadowColor: "#E74C3C",
    shadowRadius: 6,
    shadowOpacity: 0.3,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  dataContainer: {
    marginBottom: 24,
  },
  dataLabel: {
    color: "#A0A0A0",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    paddingLeft: 8,
  },
  dataValueContainer: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 14,
    minHeight: 80,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  dataValue: {
    color: "#4A90E2", // Bright blue for data
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "monospace",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  primaryButton: {
    backgroundColor: "#1E3A8A", // Deep blue
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "#7F1D1D", // Deep red
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#4A90E2",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  outlineButtonText: {
    color: "#4A90E2",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  deviceList: {
    marginBottom: 16,
    gap: 12,
  },
  deviceCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  deviceId: {
    color: "#7F8C8D",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "monospace",
  },
  deviceButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 12,
    minWidth: 100,
  },
  connectButton: {
    backgroundColor: "#14532D", // Dark green
  },
  disconnectButton: {
    backgroundColor: "#7F1D1D", // Dark red
  },
  deviceButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    color: "#7F8C8D",
    marginTop: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#7F8C8D",
    textAlign: "center",
    marginVertical: 24,
    fontWeight: "600",
    fontSize: 16,
  },
  // New glow effects
  glow: {
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
});

export default styles;
