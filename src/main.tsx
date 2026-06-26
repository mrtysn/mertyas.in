import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "../web-shared/src/styles/classless.css";
import "./styles/syntax-theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
