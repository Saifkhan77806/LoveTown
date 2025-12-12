import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { store } from "./store/store.tsx";
import { ToasterProvider } from "./components/ui/toaster.tsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <Provider store={store}>
          <ToasterProvider>
            <App />
          </ToasterProvider>
        </Provider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
