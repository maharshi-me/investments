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


  return {
    totalValue,
    invested,
    currentProfit
  }
}

export default getSummary
