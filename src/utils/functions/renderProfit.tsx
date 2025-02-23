import { formatCurrency } from "@/utils/functions/formatCurrency"

export const renderProfit = (profit: number, type: 'currency' | 'percentage' = 'currency', align: 'left' | 'right' = 'right') => {
  return <div className={`text-${align} ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
    {type === 'currency' ? formatCurrency(profit) : `${profit.toFixed(2)}%`}
  </div>
}