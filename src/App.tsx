import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { ThemeProvider } from "@/components/theme-provider";

import Settings from "@/app/Settings";
import Dashboard from "@/app/Dashboard";
import Portfolio from "@/app/Portfolio";
import Transactions from "@/app/Transactions";
import TaxAnalysis from "@/app/TaxAnalysis";

import BaseLayout from "@/layouts/BaseLayout";

import { fetchNavHistory } from "@/utils/nav-fetcher";

import getPortfolio, { RealisedProfitEntry } from "@/utils/get-portfolio";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { TypographySmall } from "@/components/ui/typography-small";

import {
  InvestmentsData,
  Transaction,
  Portfolio as PortfolioType,
  Meta,
} from "@/types/investments";

const TransactionsGuard = ({
  transactions,
  portfolio,
  realisedProfitByDate,
  Component,
}: {
  transactions: Transaction[];
  portfolio: PortfolioType;
  realisedProfitByDate: RealisedProfitEntry[];
  Component: React.ComponentType<{
    transactions: Transaction[];
    portfolio: PortfolioType;
    realisedProfitByDate: RealisedProfitEntry[];
  }>;
}) => {
  const navigate = useNavigate();

  if (!transactions.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <TypographySmall text="No transactions found. Please import your CAS first." />
        <Button onClick={() => navigate("/settings")}>Go to Import</Button>
      </div>
    );
  }

  return (
    <Component
      transactions={transactions}
      portfolio={portfolio}
      realisedProfitByDate={realisedProfitByDate}
    />
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioType>([]);
  const [realisedProfitByDate, setRealisedProfitByDate] = useState<
    RealisedProfitEntry[]
  >([]);
  const [meta, setMeta] = useState<Meta>();

  const readData = async () => {
    setIsLoading(true);
    await fetchNavHistory();
    const data = localStorage.getItem("investmentsData");

    if (data) {
      const parsedData = JSON.parse(data) as InvestmentsData;
      setMeta(parsedData.meta);
      const sortedTransactions = [...parsedData.transactions].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setTransactions(sortedTransactions);
      const { portfolio, realisedProfitByDate } =
        await getPortfolio(sortedTransactions);
      setPortfolio(portfolio);
      setRealisedProfitByDate(realisedProfitByDate);
    } else {
      setTransactions([]);
      setPortfolio([]);
      setRealisedProfitByDate([]);
      setMeta(undefined);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    readData();
  }, []);

  console.log(realisedProfitByDate);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BaseLayout isLoading={isLoading}>
        <Routes>
          <Route
            path="/"
            element={
              <TransactionsGuard
                transactions={transactions}
                portfolio={portfolio}
                realisedProfitByDate={realisedProfitByDate}
                Component={Dashboard}
              />
            }
          />
          <Route
            path="/portfolio"
            element={
              <TransactionsGuard
                transactions={transactions}
                portfolio={portfolio}
                realisedProfitByDate={realisedProfitByDate}
                Component={Portfolio}
              />
            }
          />

          <Route
            path="/tax-analysis"
            element={
              <TransactionsGuard
                transactions={transactions}
                portfolio={portfolio}
                realisedProfitByDate={realisedProfitByDate}
                Component={TaxAnalysis}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <TransactionsGuard
                transactions={transactions}
                portfolio={portfolio}
                realisedProfitByDate={realisedProfitByDate}
                Component={Transactions}
              />
            }
          />

          <Route
            path="/settings"
            element={
              <Settings
                meta={meta}
                readData={readData}
                transactions={transactions}
              />
            }
          />
        </Routes>
      </BaseLayout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
