const getShortRupeesString = n => {
  const num = n.toFixed(0)
  if (num < 1000) {
    return String(num)
  }
  else if (num < 100000) {
    return String((num / 1000).toFixed(1)) + ' ¯k'
  }

  return String((num / 100000).toFixed(1)) + ' L'
}

export default getShortRupeesString
