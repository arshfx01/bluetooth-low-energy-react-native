import { Button, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerScreen: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 12,
    padding: 24,
  },
  containerMain: {
    flex: 1,
    flexDirection: "column",
  },
  containerDevices: {
    width: "100%",
    justifyContent: "center",
  },
  containerButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 24,
  },
});

export default styles;
