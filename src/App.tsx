import { ThemeProvider } from "@/components/theme-provider"
import Settings from "@/app/Settings"
import Dashboard from "@/app/Dashboard"
import { Routes, Route } from 'react-router-dom';
import BaseLayout from "@/layouts/BaseLayout";

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BaseLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BaseLayout>
    </ThemeProvider>
  )
}

export default App
