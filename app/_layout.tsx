import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        options={{
          title: "BLE Messenger",
          headerStyle: {
            backgroundColor: "#181A20",
            borderBottomWidth: 0,
            elevation: 0,
          },
          headerTintColor: "#4A90E2",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            letterSpacing: 1.2,
            textAlign: "center",
          },
        }}
        name="index"
      />
    </Stack>
  );
}
