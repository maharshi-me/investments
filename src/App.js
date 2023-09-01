import { BrowserRouter, Routes, Route } from "react-router-dom"

import CAS from './utils/CAS'
import Dashboard from "./pages/Dashboard"
import Layout from "./pages/Layout"
import Portfolio from "./pages/Portfolio"
import Transactions from './pages/Transactions'

function App() {
  const cas = CAS()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard cas={cas} />} />
          <Route path="portfolio" element={<Portfolio cas={cas} />} />
          <Route path="transactions" element={<Transactions cas={cas} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
