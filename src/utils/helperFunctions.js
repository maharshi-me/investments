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
  })

  out.sort(byTotalCost)

  return out
}

