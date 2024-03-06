import "./App.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Symptoms } from "./symptoms";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Symptoms />
      </div>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

export default App;
