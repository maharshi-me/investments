import { ThemeProvider } from "@/components/theme-provider"
import Settings from "@/app/Settings"
import Dashboard from "@/app/Dashboard"
import { Routes, Route } from 'react-router-dom';
import BaseLayout from "@/layouts/BaseLayout";
import Transactions from "@/app/Transactions";
import { useEffect, useState } from "react"
import { fetchNavHistory } from "@/utils/nav-fetcher"

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      await fetchNavHistory()
      setIsLoading(false)
    }
    init()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BaseLayout isLoading={isLoading}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </BaseLayout>
    </ThemeProvider>
  )
}

export default App
