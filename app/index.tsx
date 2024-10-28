import { Button } from "react-native";
import MainPage from "../components/MainPage";
import { requestPermissions } from "../hooks/useBLE";
import { useState } from "react";
import { View, Text } from "react-native";
import styles from "../assets/styles/styles";

// Request BLE permissions on the first time it opens
requestPermissions();

export default function Index() {
  // Choose mode
  const [mode, setMode] = useState<"central" | "peripheral">("central");
  return (
    <View style={styles.containerScreen}>
      <Text>Bluetooh Low Energy + React Native</Text>
      <Button title="Central Mode" onPress={() => setMode("central")} />
      <Button title="Peripheral Mode" onPress={() => setMode("peripheral")} />
      {mode == "central" ? <MainPage /> : null}
    </View>
  );
}
