const byTotalCostDesc = (a, b) => {
  var keyA = a.currentInvested, keyB = b.currentInvested
  if (keyA < keyB) return 1
  if (keyA > keyB) return -1

  return 0
}

export default byTotalCostDesc
