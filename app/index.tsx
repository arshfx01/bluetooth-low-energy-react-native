import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MainPage from "../components/MainPage";
import PeripheralPage from "../components/PeripheralPage";
import { requestPermissions } from "../hooks/useBLE";

// Request BLE permissions
requestPermissions();

export default function Index() {
  const [mode, setMode] = useState<"central" | "peripheral">("central");

  return (
    <View style={styles.containerScreen}>
      {/* Premium Mode Selector */}
      <View style={localStyles.modeSwitchContainer}>
        <TouchableOpacity
          style={[
            localStyles.modeButton,
            mode === "central" && localStyles.activeCentralMode,
          ]}
          onPress={() => setMode("central")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              localStyles.modeButtonText,
              mode === "central" && localStyles.activeModeText,
            ]}
          >
            CENTRAL MODE
          </Text>
        </TouchableOpacity>

        <View style={localStyles.divider} />

        <TouchableOpacity
          style={[
            localStyles.modeButton,
            mode === "peripheral" && localStyles.activePeripheralMode,
          ]}
          onPress={() => setMode("peripheral")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              localStyles.modeButtonText,
              mode === "peripheral" && localStyles.activeModeText,
            ]}
          >
            PERIPHERAL MODE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.scrollContainer}>
        {mode === "central" ? <MainPage /> : <PeripheralPage />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerScreen: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 24,
  },
});

const localStyles = StyleSheet.create({
  modeSwitchContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 4,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  modeButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCentralMode: {
    backgroundColor: "#1E3A8A",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  activePeripheralMode: {
    backgroundColor: "#7F1D1D",
    shadowColor: "#E74C3C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modeButtonText: {
    color: "#7F8C8D",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  activeModeText: {
    color: "#FFFFFF",
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  divider: {
    width: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 8,
  },
});
