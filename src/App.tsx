import { useEffect, useState } from "react"
import { Routes, Route, useNavigate } from 'react-router-dom';

import { ThemeProvider } from "@/components/theme-provider"

import Settings from "@/app/Settings"
import Dashboard from "@/app/Dashboard"
import Portfolio from "@/app/Portfolio";
import Transactions from "@/app/Transactions";

import BaseLayout from "@/layouts/BaseLayout";

import { fetchNavHistory } from "@/utils/nav-fetcher"

import getPortfolio from "@/utils/get-portfolio"
import { Button } from "./components/ui/button";
import { TypographySmall } from "./components/ui/typography-small";
import { InvestmentsData, Transaction, Portfolio as PortfolioType } from "@/types/investments";

const TransactionsGuard = ({ transactions, portfolio, Component }: { transactions: Transaction[], portfolio: PortfolioType, Component: React.ComponentType<{ transactions: Transaction[], portfolio: PortfolioType }> }) => {
  const navigate = useNavigate()

  if (!transactions.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <TypographySmall text="No transactions found. Please import your CAS first." />
        <Button onClick={() => navigate('/settings')}>
          Go to Import
        </Button>
      </div>
    )
  }

  return (
    <Component transactions={transactions} portfolio={portfolio} />
  )
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioType>([])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await fetchNavHistory()
      const data = localStorage.getItem('investmentsData')

      if (data) {
        const parsedData = JSON.parse(data) as InvestmentsData
        const sortedTransactions = [...parsedData.transactions].sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setTransactions(sortedTransactions)
        const portfolio = await getPortfolio(sortedTransactions)
        setPortfolio(portfolio)
      }

      setIsLoading(false)
    }

    init()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BaseLayout isLoading={isLoading}>
        <Routes>
          <Route path="/" element={<TransactionsGuard transactions={transactions} portfolio={portfolio} Component={Dashboard} />} />
          <Route path="/portfolio" element={<TransactionsGuard transactions={transactions} portfolio={portfolio} Component={Portfolio} />} />
          <Route path="/transactions" element={<TransactionsGuard transactions={transactions} portfolio={portfolio} Component={Transactions} />} />

          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BaseLayout>
    </ThemeProvider>
  )
}

export default App
