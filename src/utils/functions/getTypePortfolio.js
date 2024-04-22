import getPortfolio from 'utils/functions/getPortfolio'

const ASSET_TYPE_COLORS = Object.freeze({
  Equity: '#e81e63',
  Debt: '#00bcd4'
})

const getTypePortfolio = transactions => {
  const portfolio = getPortfolio(transactions)
  let out = []

  portfolio.forEach(p => {
    let OldConstantsData = localStorage.getItem('constants_' + p.mfName)

    if (OldConstantsData) {
      OldConstantsData = JSON.parse(OldConstantsData)
    }

    let type = null

    if (OldConstantsData?.type) {
      type = OldConstantsData.type
    }

    const i = out.findIndex(o => o.type === type)

    if (i >= 0) {
      out[i].currentInvested += p.currentInvested
      out[i].currentValue += p.currentValue
    }
    else {
      out.push({
        type,
        currentInvested: p.currentInvested,
        color: ASSET_TYPE_COLORS[type],
        currentValue: p.currentValue
      })
    }
  })

  return out
}

export default getTypePortfolio
