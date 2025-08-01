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
      {/* Mode Switcher as Tab Bar */}
      <View style={localStyles.tabBar}>
        <TouchableOpacity
          style={[localStyles.tab, mode === "central" && localStyles.activeTab]}
          onPress={() => setMode("central")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              localStyles.tabText,
              mode === "central" && localStyles.activeTabText,
            ]}
          >
            CENTRAL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            localStyles.tab,
            mode === "peripheral" && localStyles.activeTab,
          ]}
          onPress={() => setMode("peripheral")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              localStyles.tabText,
              mode === "peripheral" && localStyles.activeTabText,
            ]}
          >
            PERIPHERAL
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
    backgroundColor: "#181A20",
    paddingHorizontal: 0,
    paddingTop: 0,
    justifyContent: "flex-start",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 0,
  },
});

const localStyles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#23242A",
    borderRadius: 16,
    margin: 18,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#4A90E2",
  },
  tabText: {
    color: "#AAA",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(74, 144, 226, 0.2)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
