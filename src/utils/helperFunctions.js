import { Card } from '@mui/material'

import { getAssetColor, getAssetType, getColor } from "constants"

export const isLineStartsWith = (line, text) => line.substr(0, text.length) === text
export const isLineEndsWith = (line, text) => line.substr(-text.length) === text
export const isLineIncludes = (line, text) => line.includes(text)
export const getIndexByStartingText = (lines, text) => lines.indexOf(lines.filter(line => isLineStartsWith(line, text))[0])
export const byDateAsc = (a, b) => {
  var keyA = new Date(a.date), keyB = new Date(b.date)
  if (keyA < keyB) return -1
  if (keyA > keyB) return 1

  return 0
}
  
export const byTotalCost = (a, b) => {
  var keyA = a.currentInvested, keyB = b.currentInvested
  if (keyA < keyB) return 1
  if (keyA > keyB) return -1

  return 0
}
  
export const getPortfolio = transactions => {
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
          date: transaction.date
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
          date: transaction.date
        } ]
      })
    }
  })

  out = out.filter(o => o.existingFunds.length > 0)

  out.forEach(o => {
    let invested = 0
    let units = 0
    o.existingFunds.forEach(ef => {
      invested += (ef.units * ef.price)
      units += ef.units
      ef.units /= 1000
      ef.price /= 10000
    })
    o.currentInvested = Math.round(invested / 10000000)
    o.currentUnits = units / 1000
    o.color = getColor(o.mfName)
  })

  out.sort(byTotalCost)

  return out
}

export const getTypePortfolio = transactions => {
  const portfolio = getPortfolio(transactions)
  let out = []

  portfolio.forEach(p => {
    const i = out.findIndex(o => o.type === getAssetType(p.mfName))

    if (i >= 0) {
      out[i].currentInvested += p.currentInvested
    }
    else {
      out.push({
        type: getAssetType(p.mfName),
        currentInvested: p.currentInvested,
        color: getAssetColor(p.mfName)
      })
    }
  })

  return out
}

export const CustomTooltip = ({ active, payload, nameKey, hideLabel }) => {
  if (active && payload && payload.length) {
    return (
      <Card raised style={{opacity: '85%'}}>
        <div style={{margin: 10}}>
          {!hideLabel && <span>{payload[0].payload[nameKey]} : </span>}
          <span style={{fontWeight:"bolder"}}>{payload[0].value.toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
        </div>
      </Card>
    )
  }

  return null
}