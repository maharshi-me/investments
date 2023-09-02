const byDateDesc = (a, b) => {
  var keyA = new Date(a.date), keyB = new Date(b.date)
  if (keyA < keyB) return 1
  if (keyA > keyB) return -1

  return 0
}

export default byDateDesc
