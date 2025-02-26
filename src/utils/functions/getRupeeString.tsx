const getRupeesString = n => n.toLocaleString('en-IN', { style: "currency", currency: "INR", maximumFractionDigits: 0 })

export default getRupeesString