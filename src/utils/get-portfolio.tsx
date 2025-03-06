import { byDateAsc, byTotalCostDesc, stringToColour } from '@/utils/functions'
import { navHistoryDB } from '@/utils/db'
import { Transaction, Portfolio } from '@/types/investments'

const getLatestPrice = async (schemeCode: string) => {
  const data = await navHistoryDB.get(schemeCode)

  if (data) {
    return Number(data.data.data[0].nav)
  }

  return null
}

const getPortfolio = async (transactions: Transaction[]): Promise<Portfolio> => {
  const ts = transactions.slice()
  ts.sort(byDateAsc)
  const out: Portfolio = []

  ts.forEach(transaction => {
    const i = out.findIndex(o => o.mfName === transaction.mfName)
    if (i >= 0) {
      out[i].allTransactions.push(transaction)
      if (transaction.type === 'Investment') {
        out[i].existingFunds.push({
          price: transaction.price * 10000,
          units: transaction.units * 1000,
          date: new Date(transaction.date),
        })
      }
      else {
        let units = Math.round(transaction.units * 1000)

        while (units > 0) {
          if (out[i].existingFunds[0].units <= units) {
            units -= out[i].existingFunds[0].units
            out[i].realisedProfit += (transaction.price - out[i].existingFunds[0].price / 10000) * (out[i].existingFunds[0].units / 1000)
            out[i].existingFunds[0].units = 0
          }
          else {
            out[i].existingFunds[0].units -= units
            out[i].realisedProfit += (transaction.price - out[i].existingFunds[0].price / 10000) * (units / 1000)
            units = 0
          }
          if (out[i].existingFunds[0].units === 0) {
            out[i].existingFunds.shift()
          }
        }
      }
    }
    else {
      out.push({
        mfName: transaction.mfName,
        schemeCode: transaction.matchingScheme.schemeCode,
        allTransactions: [ transaction ],
        existingFunds: [ {
          price: transaction.price * 10000,
          units: transaction.units * 1000,
          date: new Date(transaction.date)
        } ],
        realisedProfit: 0
      })
    }
  })

  for (const o of out) {
    let invested = 0
    let units = 0
    o.latestPrice = await getLatestPrice(o.schemeCode)
    for (const ef of o.existingFunds) {
      invested += (ef.units * ef.price)
      units += ef.units
      ef.units /= 1000
      ef.price /= 10000
      ef.invested = ef.units * ef.price
      ef.currentValue = o.latestPrice ? (ef.units * o.latestPrice) : 0
      ef.profit = ef.currentValue - ef.invested
      ef.gain = (ef.profit / ef.invested) * 100
    }
    o.currentInvested = Math.round(invested / 10000000)
    o.currentUnits = units > 0.00001 ? (units / 1000) : 0
    o.currentValue = o.latestPrice ? (o.currentUnits * o.latestPrice) : 0
    o.profit = o.currentValue - o.currentInvested
    o.color = stringToColour(o.mfName)
  }

  let totalInvested = 0
  for (const o of out) {
    totalInvested += o.currentInvested
  }
  for (const o of out) {
    o.percentage = (o.currentInvested / totalInvested) * 100
  }
  out.sort(byTotalCostDesc)

  return out
}

export default getPortfolio