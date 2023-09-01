const MUTUAL_FUNDS = Object.freeze({
  "HDFC Index Fund - NIFTY 50": {
    type: "Equity"
  },
  "UTI Nifty 50 Index Fund": {
    type: "Equity"
  },
  "Mirae Asset Tax Saver Fund": {
    type: "Equity"
  },
  "UTI Nifty Next 50 Index Fund": {
    type: "Equity"
  },
  "ICICI Prudential Long Term Equity Fund ( Tax Saving )": {
    type: "Equity"
  },
  "NIPPON INDIA LIQUID FUND": {
    type: "Debt"
  },
  "Axis Liquid Fund": {
    type: "Debt"
  },
  "PGIM India Liquid Fund": {
    type: "Debt"
  },
  "ICICI Prudential Liquid Fund": {
    type: "Debt"
  },
  "ICICI Prudential Banking and PSU Debt Fund": {
    type: "Debt"
  },
  "SBI Liquid Fund": {
    type: "Debt"
  },
  "HDFC Liquid Fund": {
    type: "Debt"
  },
  "UTI Liquid Cash": {
    type: "Debt"
  },
  "Aditya Birla Sun Life Liquid Fund": {
    type: "Debt"
  }
})

export const getAssetType = mfName => MUTUAL_FUNDS[mfName].type
