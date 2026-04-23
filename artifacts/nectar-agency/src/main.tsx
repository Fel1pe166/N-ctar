import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerAdminTokenGetter } from "@/lib/adminAuth";

registerAdminTokenGetter();

createRoot(document.getElementById("root")!).render(<App />);
