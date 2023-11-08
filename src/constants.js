const MUTUAL_FUNDS = Object.freeze({
  "HDFC Index Fund - NIFTY 50": {
    type: "Equity",
    color: "#00bcd4"
  },
  "UTI Nifty 50 Index Fund": {
    type: "Equity",
    color: "#e81e63"
  },
  "Mirae Asset Tax Saver Fund": {
    type: "Equity",
    color: "#f44336"
  },
  "UTI Nifty Next 50 Index Fund": {
    type: "Equity",
    color: "#ffeb3b"
  },
  "ICICI Prudential ELSS Tax Saver Fund": {
    type: "Equity",
    color: "#9c27b0"
  },
  "NIPPON INDIA LIQUID FUND": {
    type: "Liquid",
    color: "#795548"
  },
  "Axis Liquid Fund": {
    type: "Liquid",
    color: "#795548"
  },
  "PGIM India Liquid Fund": {
    type: "Liquid",
    color: "#607d8b"
  },
  "ICICI Prudential Liquid Fund": {
    type: "Liquid",
    color: "#607d8b"
  },
  "ICICI Prudential Banking and PSU Debt Fund": {
    type: "Debt",
    color: "#607d8b"
  },
  "SBI Liquid Fund": {
    type: "Liquid",
    color: "#607d8b"
  },
  "HDFC Liquid Fund": {
    type: "Liquid",
    color: '#607d8b'
  },
  "UTI Liquid Fund": {
    type: "Liquid",
    color: "#607d8b"
  },
  "Aditya Birla Sun Life Liquid Fund": {
    type: "Liquid",
    color: "#8bc34a"
  }
})

const ASSET_TYPE_COLORS = Object.freeze({
  Equity: '#e81e63',
  Debt: '#e8fe03',
  Liquid: '#00bcd4'
})

export const getAssetType = mfName => MUTUAL_FUNDS[mfName].type
export const getAssetColor = mfName => ASSET_TYPE_COLORS[MUTUAL_FUNDS[mfName].type]
export const getColor = mfName => MUTUAL_FUNDS[mfName].color
