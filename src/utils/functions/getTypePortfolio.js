import { getAssetColor, getAssetType } from "constants"

import getPortfolio from 'utils/functions/getPortfolio'

const getTypePortfolio = transactions => {
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

export default getTypePortfolio
