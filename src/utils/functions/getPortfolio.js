import { getColor } from "constants"

import byDateAsc from 'utils/functions/byDateAsc'
import byTotalCostDesc from "utils/functions/byTotalCostDesc"

const getLatestPrice = (mfname) => {
  let data = localStorage.getItem(mfname)
  
  if (data) {
    data = JSON.parse(data)
    return Number(data.data[0].nav)
  }

  return null
}

const getPortfolio = transactions => {
  let ts = transactions.slice()
  ts.sort(byDateAsc)
  let out = []
  
  ts.forEach(transaction => {
    const i = out.findIndex(o => o.mfName === transaction.mfName)
    if (i >= 0) {
      out[i].allTransactions.push(transaction)
      if (transaction.type === 'Investment') {
        out[i].existingFunds.push({
          price: transaction.price * 10000,
          units: transaction.units * 1000,
          date: new Date(transaction.date)
        })
      }
      else {
        let units = transaction.units * 1000

        while (units > 0) {
          if (out[i].existingFunds[0].units <= units) {
            units -= out[i].existingFunds[0].units
            out[i].existingFunds[0].units = 0
          }
          else {
            out[i].existingFunds[0].units -= units
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
        allTransactions: [ transaction ],
        existingFunds: [ {
          price: transaction.price * 10000,
          units: transaction.units * 1000,
          date: new Date(transaction.date)
        } ]
      })
    }
  })

  out.forEach(o => {
    let invested = 0
    let units = 0
    o.latestPrice = getLatestPrice(o.mfName)
    o.existingFunds.forEach(ef => {
      invested += (ef.units * ef.price)
      units += ef.units
      ef.units /= 1000
      ef.price /= 10000
      ef.invested = ef.units * ef.price
      ef.currentValue = o.latestPrice ? (ef.units * o.latestPrice) : 0
      ef.profit = ef.currentValue - ef.invested
      ef.gain = (ef.profit / ef.invested) * 100
    })
    o.currentInvested = Math.round(invested / 10000000)
    o.currentUnits = units > 0.00001 ? (units / 1000) : 0
    o.currentValue = o.latestPrice ? (o.currentUnits * o.latestPrice) : 0
    o.profit = o.currentValue - o.currentInvested
    o.color = getColor(o.mfName)
  })

  out.forEach(o => o.percentage = (o.currentInvested / out.reduce((a, b) => a + b.currentInvested, 0)) * 100)
  out.sort(byTotalCostDesc)

  return out
}

export default getPortfolio
