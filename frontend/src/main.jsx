// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";   // 👈 ensure extension if using Vite + JSX
import "./index.css";

import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <SearchProvider>
      <App />
    </SearchProvider>
  </ThemeProvider>
);
