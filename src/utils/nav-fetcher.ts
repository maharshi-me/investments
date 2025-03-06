import { navHistoryDB } from "./db"

interface Transaction {
  matchingScheme?: {
    schemeCode: string
    schemeName: string
  }
}

interface NavResponse {
  meta: {
    fund_house: string
    scheme_type: string
    scheme_category: string
    scheme_code: number
    scheme_name: string
  }
  data: Array<{
    date: string
    nav: string
  }>
}

const shouldRefetch = (timestamp: number): boolean => {
  const lastFetchDate = new Date(timestamp)
  const currentDate = new Date()

  // If it's the same day, don't refetch
  if (lastFetchDate.toDateString() === currentDate.toDateString()) {
    return false
  }

  // If it's after 1am, allow refetch
  const currentHour = currentDate.getHours()
  return currentHour >= 1
}

export const fetchNavHistory = async () => {
  const data = localStorage.getItem('investmentsData')
  if (!data) return

  const parsedData = JSON.parse(data)
  const uniqueSchemeCodes = [...new Set(parsedData.transactions
    .map((t: Transaction) => t.matchingScheme?.schemeCode)
    .filter(Boolean)
  )] as number[]

  console.log('Unique scheme codes:', uniqueSchemeCodes)

  for (const schemeCode of uniqueSchemeCodes) {
    try {
      // Check if we have valid cached data
      const cachedData = await navHistoryDB.get(schemeCode)
      const shouldUpdate = !cachedData?.timestamp || shouldRefetch(cachedData.timestamp)

      if (!shouldUpdate) {
        console.log(`Using cached NAV data for scheme ${schemeCode}`)
        continue
      }

      console.log(`Fetching NAV for scheme ${schemeCode}`)
      const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`)
      const navData: NavResponse = await response.json()

      // Store in IndexedDB
      await navHistoryDB.set(schemeCode, navData)
      console.log(`NAV history stored for scheme ${schemeCode}`)

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error fetching NAV for scheme ${schemeCode}:`, error)
    }
  }
}