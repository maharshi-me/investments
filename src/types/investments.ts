export interface InvestmentsData {
  meta: Meta
  holder: Holder
  summary: unknown
  transactions: Transaction[]
}

export interface Meta {
  exportedAt: string
  from: string
  to: string
}

export interface Holder {
  name: string
  email: string
  mobile: string
  address: string
}

export interface Transaction {
  mfNameFull: string
  isin: string
  matchingScheme: MatchingScheme
  mfName: string
  folio: string
  date: string
  amount: number
  type: "Investment" | "Redemption"
  price: number
  units: number
  content: string
  key: number
}

export interface MatchingScheme {
  schemeCode: number
  schemeName: string
  isinGrowth: string
  isinDivReinvestment: unknown
}

export type Portfolio = PortfolioRow[]

export interface PortfolioRow {
  mfName: string
  schemeCode: number
  allTransactions: Transaction[]
  existingFunds: ExistingFund[]
  realisedProfit: number
  latestPrice: number
  currentInvested: number
  currentUnits: number
  currentValue: number
  profit: number
  color: string
  percentage: number
}

export interface ExistingFund {
  price: number
  units: number
  date: Date
  invested: number
  currentValue: number
  profit: number
  gain: number
}
