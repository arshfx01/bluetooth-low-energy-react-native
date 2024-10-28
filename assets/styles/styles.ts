import { Button, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    flexDirection: "column",
    padding: 24,
  },
  containerDevices: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "blue",
    padding: 24,
  },
  containerButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 24,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    marginTop: 50,
    marginBottom: 50,
    padding: 50,
    color: "red",
    backgroundColor: "blue",
  },
});

export default styles;
