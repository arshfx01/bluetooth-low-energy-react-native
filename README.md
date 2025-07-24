# BLE Messenger

A modern React Native chat-style app demonstrating Bluetooth Low Energy (BLE) communication in both **Central** and **Peripheral** modes, with a beautiful messenger UI.

---

## Features

- **Central Mode**: Scan for BLE peripherals, connect, and send/receive messages in a chat interface.
- **Peripheral Mode**: Advertise as a BLE device, receive messages from a central, and display them in a chat bubble UI.
- **Modern UI/UX**: Messenger-style chat, animated status, device picker, and more.
- **BLE Permissions**: Handles all required permissions for Android 12+ (including BLUETOOTH_ADVERTISE).
- **Debug Logs**: Collapsible activity log for BLE events and errors.

---

## Main BLE Libraries Used

- [`react-native-ble-plx`](https://github.com/dotintent/react-native-ble-plx): For BLE central/client functionality (scanning, connecting, reading/writing characteristics).
- [`react-native-ble-peripheral`](https://github.com/antoniovini47/react-native-ble-peripheral): For BLE peripheral/advertising functionality (Android only).

---

## Custom Native Code / Patches

- **Patched BLE Peripheral Module**: The app uses a custom patch for `react-native-ble-peripheral` to:
  - Emit a JS event (`onCentralWrite`) when the central writes to a characteristic, so the peripheral can display incoming messages in real time.
  - Add required `addListener` and `removeListeners` methods for React Native event emitter compatibility.
- **Patch Management**: All patches are managed with [`patch-package`](https://www.npmjs.com/package/patch-package). See the `patches/` directory.

---

## How to Run

1. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
2. **Apply patches (automatically runs after install):**
   ```sh
   npx patch-package
   ```
3. **Build a custom dev client (required for BLE peripheral):**
   ```sh
   eas build --profile development --platform android --clear-cache
   # Install the resulting APK on your device
   ```
4. **Run the app:**
   - Use the EAS Dev Client or your custom build (Expo Go will NOT work for BLE peripheral mode).
   - Grant all requested permissions (especially BLUETOOTH_ADVERTISE on Android 12+).

---

## Permissions

- The app requests and requires the following permissions on Android:
  - `BLUETOOTH`
  - `BLUETOOTH_ADMIN`
  - `BLUETOOTH_CONNECT`
  - `BLUETOOTH_SCAN`
  - `BLUETOOTH_ADVERTISE`
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_COARSE_LOCATION`
- All permissions are handled at runtime for Android 12+.

---

## How BLE Messaging Works

- **Central (MainPage):**
  - Scans for peripherals, connects, and sends messages as BLE characteristic writes.
  - Displays sent and received messages in chat bubbles.
- **Peripheral (PeripheralPage):**
  - Advertises as a BLE device and receives messages from the central.
  - Uses a patched native module to emit incoming messages to JS, which are shown in the chat UI.

---

## Notes

- **Peripheral mode is Android only** (due to library limitations).
- **Expo Go is NOT supported** for BLE peripheral mode; use EAS Dev Client or a custom build.
- **All BLE logic is handled in JS, except for the patched event emitter in the peripheral native module.**
- **UI/UX**: The app is styled to feel like a real messenger, with chat bubbles, device picker, and animated status.

---

## Cloning & Building the App Yourself

If you want to use this app as a template or make it your own, follow these steps:

### 1. **Clone the repository**

```sh
# Replace YOUR_GITHUB_USERNAME with your own if you forked
 git clone https://github.com/arshfx01/bluetooth-low-energy-react-native.git
 cd bluetooth-low-energy-react-native
```

### 2. **Install dependencies and patches**

```sh
npm install
npx patch-package
```

### 3. **Set up your own Expo/EAS project**

- **Create an Expo account** at https://expo.dev/signup if you don't have one.
- **Update `app.json`**:
  - Change the `name`, `slug`, and `owner` fields to your own values.
  - Change the `android.package` and `ios.bundleIdentifier` to unique values (e.g., `com.yourname.blemessenger`).
  - Example:
    ```json
    {
      "expo": {
        "name": "My BLE Messenger",
        "slug": "my-ble-messenger",
        "owner": "your-expo-username",
        ...
        "android": {
          "package": "com.yourname.blemessenger"
        },
        "ios": {
          "bundleIdentifier": "com.yourname.blemessenger"
        }
      }
    }
    ```
- **Link your project to your Expo account:**
  ```sh
  eas init --id <your-eas-project-id>
  # Or just run eas init and follow the prompts
  ```
- **Set the correct owner in EAS:**
  - In `app.json`, set the `owner` field to your Expo username or organization.
  - In EAS, make sure the project is under your account.

### 4. **Build with your own credentials**

- Run:
  ```sh
  eas build --profile development --platform android --clear-cache
  ```
- Follow the prompts to set up your own keystore/credentials if needed.
- Download and install the APK on your device.

---

## Contributing

- If you make changes to the BLE native code, re-run `npx patch-package` and commit the new patch.
- PRs for improved BLE support, iOS peripheral support, or UI/UX enhancements are welcome!

---

## License

MIT
