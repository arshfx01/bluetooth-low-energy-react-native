import MainPage from "../components/MainPage";
import { requestPermissions } from "../hooks/useBLE";

// Request BLE permissions on the first time it opens
requestPermissions();

export default function Index() {
  return <MainPage />;
}
