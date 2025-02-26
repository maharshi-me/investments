import { Transaction, Portfolio } from "@/types/investments"

import Cards from "./components/Cards"
import TransactionCard from "./components/TransactionChart"

// Update the Dashboard component to use both functions
export default function Dashboard({ transactions, portfolio }: { transactions: Transaction[], portfolio: Portfolio }) {

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Cards portfolio={portfolio} />
      <div className="grid auto-rows-min gap-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        <TransactionCard transactions={transactions} />
      </div>
    </div>
  )
}
