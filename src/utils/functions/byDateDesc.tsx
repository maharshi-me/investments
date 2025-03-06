const byDateDesc = (a: any, b: any) => {
  const keyA = new Date(a.date)
  const keyB = new Date(b.date)
  if (keyA < keyB) return 1
  if (keyA > keyB) return -1

  return 0
}

export default byDateDesc