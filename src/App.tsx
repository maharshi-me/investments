import { ThemeProvider } from "@/components/theme-provider"
import Settings from "@/app/Settings"
import Dashboard from "@/app/Dashboard"
import { Routes, Route } from 'react-router-dom';
import BaseLayout from "@/layouts/BaseLayout";
import Transactions from "@/app/Transactions";
import { Toaster } from "@/components/ui/toaster"

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BaseLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </BaseLayout>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
