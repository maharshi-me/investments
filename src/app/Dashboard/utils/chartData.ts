import { Transaction } from "@/types/investments"

export function getLastTwelveMonthsData(transactions: Transaction[]): { month: string, transactions: number }[] {
  // Get current date
  const today = new Date();

  // Create array of last 12 months
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      month: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
      timestamp: date.getTime(),
    };
  }).reverse();

  // Group transactions by month
  const monthlyTotals = last12Months.map(monthData => {
    const nextMonth = new Date(monthData.timestamp);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(monthData.timestamp) &&
             transactionDate < nextMonth;
    });

    const total = monthlyTransactions.reduce((sum, transaction) => {
      if (transaction.type === "Investment") {
        return sum + transaction.amount
      }

      return sum - transaction.amount
    }, 0);

    return {
      month: monthData.month,
      transactions: total
    };
  });

  return monthlyTotals;
}

export function getAllMonthsData(transactions: Transaction[]): { month: string, transactions: number }[] {
  if (transactions.length === 0) return [];

  // Find first and last transaction dates
  const dates = transactions.map(t => new Date(t.date));
  const firstDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const lastDate = new Date();

  // Calculate number of months between first transaction and now
  const months = (lastDate.getFullYear() - firstDate.getFullYear()) * 12
    + (lastDate.getMonth() - firstDate.getMonth()) + 1;

  // Create array of all months since first transaction
  const allMonths = Array.from({ length: months }, (_, i) => {
    const date = new Date(firstDate.getFullYear(), firstDate.getMonth() + i, 1);
    return {
      month: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
      timestamp: date.getTime(),
    };
  });

  // Group transactions by month
  const monthlyTotals = allMonths.map(monthData => {
    const nextMonth = new Date(monthData.timestamp);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(monthData.timestamp) &&
             transactionDate < nextMonth;
    });

    const total = monthlyTransactions.reduce((sum, transaction) => {
      if (transaction.type === "Investment") {
        return sum + transaction.amount
      }
      return sum - transaction.amount
    }, 0);

    return {
      month: monthData.month,
      transactions: total
    };
  });

  return monthlyTotals;
}

export function getAnnualData(transactions: Transaction[]): { month: string, transactions: number }[] {
  if (transactions.length === 0) return [];

  // Group transactions by year
  const groupedByYear = transactions.reduce((acc, transaction) => {
    const year = new Date(transaction.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Calculate yearly totals
  return Object.entries(groupedByYear)
    .map(([year, yearTransactions]) => {
      const total = yearTransactions.reduce((sum, transaction) => {
        if (transaction.type === "Investment") {
          return sum + transaction.amount;
        }
        return sum - transaction.amount;
      }, 0);

      return {
        month: year, // Using 'month' key to maintain compatibility with chart
        transactions: total
      };
    })
    .sort((a, b) => Number(a.month) - Number(b.month));
}