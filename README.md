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

### 5. **Run the App After Installing the Build (EAS Dev Client Workflow)**

- On your computer, start the Metro server for the Dev Client build:
  ```sh
  npx expo start --dev-client
  ```
- A QR code will appear in your terminal or browser.
- On your phone, open the camera app and scan the QR code.
- Tap the link that appears; it will open your installed EAS Dev Client and load the BLE Messenger app.
- On first launch, grant all requested permissions (Bluetooth, Location, etc.) for full functionality.
- If the app doesn't open, make sure your phone and computer are on the same Wi-Fi network and the Dev Client is installed.
- If you have issues, try restarting Metro (`Ctrl+C` then rerun the command), or reinstall the Dev Client APK.

---

## ⚡️ Native Code Changes (Java)

- If you make changes to the Java code (e.g., in `node_modules/react-native-ble-peripheral/android/`), you need to rebuild the native app for local testing:
  ```sh
  npx expo run:android
  ```
- **Do NOT change the Gradle settings** in this repo unless you know what you're doing. They are patched for compatibility with modern Expo/React Native builds.
- After making native changes, re-run `npx patch-package react-native-ble-peripheral` and commit the new patch.

---

## 🧭 User Flow

1. **Launch the App**

   - Open the app on your Android device. You will see a modern tab bar to select between Central and Peripheral modes.

2. **Choose a Mode**

   - **Central (Client):**
     - Tap the 'Central' tab.
     - The app scans for nearby BLE peripherals advertising the correct service.
     - Select a device from the list to connect.
     - Once connected, a chat interface appears.
     - Type a message in the input bar and tap send. Messages are sent to the connected peripheral and displayed in the chat.
     - Received messages from the peripheral appear as chat bubbles.
     - Tap 'Disconnect' to end the session and return to the device list.
   - **Peripheral (Server):**
     - Tap the 'Peripheral' tab.
     - The app starts advertising as a BLE peripheral with a chat service.
     - When a central device connects and sends a message, it appears in the chat area.
     - You can view logs and status, but sending messages from the peripheral is not supported (due to library limitations).
     - Stop advertising to end the session.

3. **Switching Roles**

   - You can switch between Central and Peripheral modes at any time using the tab bar.
   - For two-way chat, run the app on two devices: one as Central, one as Peripheral.

4. **Permissions**
   - The app will request Bluetooth and location permissions as needed. Grant all permissions for full functionality.

---

## Contributing

- If you make changes to the BLE native code, re-run `npx patch-package` and commit the new patch.
- PRs for improved BLE support, iOS peripheral support, or UI/UX enhancements are welcome!

---

## License

MIT
