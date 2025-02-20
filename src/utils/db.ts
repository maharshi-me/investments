import { openDB } from 'idb'

const dbName = 'mf-tracker'
const navStoreKey = 'nav-history'

interface NavMeta {
  fund_house: string
  scheme_type: string
  scheme_category: string
  scheme_code: number
  scheme_name: string
  isin_growth: string | null
  isin_div_reinvestment: string | null
}

interface NavDataPoint {
  date: string
  nav: string
}

interface NavResponse {
  meta: NavMeta
  data: NavDataPoint[]
  status: string
}

interface NavData {
  data: NavResponse
  timestamp: number
}

export const db = await openDB(dbName, 1, {
  upgrade(db) {
    // Create a store for NAV history if it doesn't exist
    if (!db.objectStoreNames.contains(navStoreKey)) {
      db.createObjectStore(navStoreKey)
    }
  },
})

export const navHistoryDB = {
  async get(schemeCode: string) {
    return db.get(navStoreKey, schemeCode) as Promise<NavData | undefined>
  },

  async set(schemeCode: string, data: NavResponse) {
    const navData: NavData = {
      data,
      timestamp: Date.now()
    }
    return db.put(navStoreKey, navData, schemeCode)
  },

  async getAll() {
    return db.getAll(navStoreKey) as Promise<NavData[]>
  },

  async clear() {
    return db.clear(navStoreKey)
  }
}