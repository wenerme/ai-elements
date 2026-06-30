import "./global.css";
import { createRoot } from "react-dom/client";

import { PreviewApp } from "./preview-app";

const root = document.querySelector("#root");

if (!root) {
  throw new Error("Missing #root element");
}

createRoot(root).render(<PreviewApp />);
