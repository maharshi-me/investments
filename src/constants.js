const MUTUAL_FUNDS = Object.freeze({
  "HDFC Index Fund - NIFTY 50": {
    type: "Equity",
    color: "#00bcd4",
    url: "https://api.mfapi.in/mf/119063"
  },
  "UTI Nifty 50 Index Fund": {
    type: "Equity",
    color: "#e81e63",
    url: "https://api.mfapi.in/mf/120716"
  },
  "Mirae Asset Tax Saver Fund": {
    type: "Equity",
    color: "#f44336",
    url: "https://api.mfapi.in/mf/135781"
  },
  "UTI Nifty Next 50 Index Fund": {
    type: "Equity",
    color: "#ffeb3b",
    url: "https://api.mfapi.in/mf/143341"
  },
  "ICICI Prudential ELSS Tax Saver Fund": {
    type: "Equity",
    color: "#9c27b0",
    url: "https://api.mfapi.in/mf/120592"
  },
  "NIPPON INDIA LIQUID FUND": {
    type: "Liquid",
    color: "#795548",
    url: "https://api.mfapi.in/mf/118701"
  },
  "Axis Liquid Fund": {
    type: "Liquid",
    color: "#795548",
    url: "https://api.mfapi.in/mf/120389"
  },
  "PGIM India Liquid Fund": {
    type: "Liquid",
    color: "#607d8b",
    url: "https://api.mfapi.in/mf/138299"
  },
  "ICICI Prudential Liquid Fund": {
    type: "Liquid",
    color: "#607d8b",
    url: "https://api.mfapi.in/mf/120197"
  },
  "ICICI Prudential Banking and PSU Debt Fund": {
    type: "Debt",
    color: "#607d8b",
    url: "https://api.mfapi.in/mf/120256"
  },
  "SBI Liquid Fund": {
    type: "Liquid",
    color: "#607d8b",
    url: "https://api.mfapi.in/mf/119800"
  },
  "HDFC Liquid Fund": {
    type: "Liquid",
    color: '#607d8b',
    url: "https://api.mfapi.in/mf/119091"
  },
  "UTI Liquid Fund": {
    type: "Liquid",
    color: "#607d8b",
    url: "https://api.mfapi.in/mf/120304"
  },
  "Aditya Birla Sun Life Liquid Fund": {
    type: "Liquid",
    color: "#8bc34a",
    url: "https://api.mfapi.in/mf/119568"
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
export const getURL = mfName => MUTUAL_FUNDS[mfName].url
