import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createClient } from "@supabase/supabase-js";
import { AuthProvider } from "./hooks/auth";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
};

const theme = extendTheme({ colors });

const supabase = createClient('https://rykjmxrsxfstlagfrfnr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5a2pteHJzeGZzdGxhZ2ZyZm5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUxNjA2NzgsImV4cCI6MjAzMDczNjY3OH0.iwO1h3YU4oyapzud0pWRYQ1LTkPMTCbIwHTULlhy4lk');

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
);

export { supabase };