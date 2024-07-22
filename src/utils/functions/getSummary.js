import getPortfolio from 'utils/functions/getPortfolio'

const getSummary = transactions => {
  const portfolio = getPortfolio(transactions)

  const totalValue = portfolio.reduce((res, item) => {
    return res + item.currentValue
  }, 0)

  const invested = portfolio.reduce((res, item) => {
    return res + item.currentInvested
  }, 0)

  const currentProfit = portfolio.reduce((res, item) => {
    return res + item.profit
  }, 0)

  const realisedProfit = portfolio.reduce((res, item) => {
    return res + item.realisedProfit
  }, 0)

  const allTimeProfit = currentProfit + realisedProfit


  return {
    totalValue,
    invested,
    allTimeProfit
  }
}

export default getSummary
