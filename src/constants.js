const MUTUAL_FUNDS = Object.freeze({
  "HDFC Index Fund - NIFTY 50": {
    type: "Equity",
    color: "#f44336"
  },
  "UTI Nifty 50 Index Fund": {
    type: "Equity",
    color: "#2196f3"
  },
  "Mirae Asset Tax Saver Fund": {
    type: "Equity",
    color: "#8bc34a"
  },
  "UTI Nifty Next 50 Index Fund": {
    type: "Equity",
    color: "#ffc107"
  },
  "ICICI Prudential Long Term Equity Fund ( Tax Saving )": {
    type: "Equity",
    color: "#795548"
  },
  "NIPPON INDIA LIQUID FUND": {
    type: "Debt",
    color: "#9c27b0"
  },
  "Axis Liquid Fund": {
    type: "Debt",
    color: "#ffeb3b"
  },
  "PGIM India Liquid Fund": {
    type: "Debt",
    color: "#607d8b"
  },
  "ICICI Prudential Liquid Fund": {
    type: "Debt",
    color: "#e81e63"
  },
  "ICICI Prudential Banking and PSU Debt Fund": {
    type: "Debt",
    color: "#e8fe03"
  },
  "SBI Liquid Fund": {
    type: "Debt",
    color: "#607d8b"
  },
  "HDFC Liquid Fund": {
    type: "Debt",
    color: '#607d8b'
  },
  "UTI Liquid Cash": {
    type: "Debt",
    color: "#607d8b"
  },
  "Aditya Birla Sun Life Liquid Fund": {
    type: "Debt",
    color: "#9c27b0"
  }
})

const ASSET_TYPE_COLORS = Object.freeze({
  Equity: '#e81e63',
  Debt: '#00bcd4'
})

export const getAssetType = mfName => MUTUAL_FUNDS[mfName].type
export const getAssetColor = mfName => ASSET_TYPE_COLORS[MUTUAL_FUNDS[mfName].type]
export const getColor = mfName => MUTUAL_FUNDS[mfName].color
