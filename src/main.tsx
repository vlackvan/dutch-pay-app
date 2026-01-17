import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

import "./index.css";
import "./styles/global.css";
import "./styles/tokens.css"; // ✅ 네 프로젝트 파일명이 token.css면 이걸로!

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
