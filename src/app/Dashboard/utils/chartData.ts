import { Transaction } from "@/types/investments";
import { formatDate } from "@/utils/functions";

export function getLastTwelveMonthsData(transactions: Transaction[]): { name: string; value: number }[] {
  const today = new Date();

  // Create array of last 12 months
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      month: `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
      timestamp: date.getTime(),
    };
  }).reverse();

  // Group transactions by month
  const monthlyTotals = last12Months.map((monthData) => {
    const nextMonth = new Date(monthData.timestamp);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(monthData.timestamp) && transactionDate < nextMonth;
    });

    const total = monthlyTransactions.reduce((sum, transaction) => {
      if (transaction.type === "Investment") {
        return sum + transaction.amount;
      }

      return sum - transaction.amount;
    }, 0);

    return {
      name: monthData.month,
      value: total,
    };
  });

  return monthlyTotals;
}

export function getAllMonthsData(transactions: Transaction[]): { name: string; value: number }[] {
  if (transactions.length === 0) return [];

  // Find first and last transaction dates
  const dates = transactions.map((t) => new Date(t.date));
  const firstDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const lastDate = new Date();

  // Calculate number of months between first transaction and now
  const months =
    (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth()) + 1;

  // Create array of all months since first transaction
  const allMonths = Array.from({ length: months }, (_, i) => {
    const date = new Date(firstDate.getFullYear(), firstDate.getMonth() + i, 1);
    return {
      month: `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
      timestamp: date.getTime(),
    };
  });

  // Group transactions by month
  const monthlyTotals = allMonths.map((monthData) => {
    const nextMonth = new Date(monthData.timestamp);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(monthData.timestamp) && transactionDate < nextMonth;
    });

    const total = monthlyTransactions.reduce((sum, transaction) => {
      if (transaction.type === "Investment") {
        return sum + transaction.amount;
      }
      return sum - transaction.amount;
    }, 0);

    return {
      name: monthData.month,
      value: total,
    };
  });

  return monthlyTotals;
}

export function getAnnualData(transactions: Transaction[]): { name: string; value: number }[] {
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
        name: year, // Using 'month' key to maintain compatibility with chart
        value: total,
      };
    })
    .sort((a, b) => Number(a.name) - Number(b.name));
}

export const getAllTimePerformance = (transactions: Transaction[]): unknown => {
  if (transactions.length === 0) return [];

  const sortedTransactions = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Find first and last transaction dates
  const firstDate = sortedTransactions[0].date;
  const lastDate = new Date();

  // Create array of all dates since first transaction
  const allDatesObjects = [];
  let transactionIndex = 0;
  const currentHoldings: { [key: string]: { units: number; price: number; date: Date }[] } = {};

  for (let d = new Date(firstDate); d <= lastDate; d.setDate(d.getDate() + 1)) {
    while (transactionIndex < sortedTransactions.length && new Date(sortedTransactions[transactionIndex].date) <= d) {
      transactionIndex++;
    }

    allDatesObjects.push({
      dateObj: new Date(d),
      name: formatDate(d),
      valueOne: currentInvested,
    });
  }

  // Group transactions by date

  return allDatesObjects;
};
