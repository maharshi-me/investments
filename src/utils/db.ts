import { openDB, IDBPDatabase } from 'idb'

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

let db: IDBPDatabase | null = null

const initDB = async () => {
  if (!db) {
    db = await openDB(dbName, 1, {
      upgrade(db) {
        // Create a store for NAV history if it doesn't exist
        if (!db.objectStoreNames.contains(navStoreKey)) {
          db.createObjectStore(navStoreKey)
        }
      },
    })
  }
  return db
}

export const navHistoryDB = {
  async get(schemeCode: number) {
    const database = await initDB()
    return database.get(navStoreKey, schemeCode) as Promise<NavData | undefined>
  },

  async set(schemeCode: number, data: NavResponse) {
    const database = await initDB()
    const navData: NavData = {
      data,
      timestamp: Date.now()
    }
    return database.put(navStoreKey, navData, schemeCode)
  },

  async getAll() {
    const database = await initDB()
    return database.getAll(navStoreKey) as Promise<NavData[]>
  },

  async clear() {
    const database = await initDB()
    return database.clear(navStoreKey)
  }
}