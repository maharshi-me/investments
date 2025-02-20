import { navHistoryDB } from "./db"

interface Transaction {
  matchingScheme?: {
    schemeCode: string
    schemeName: string
  }
}

export const fetchNavHistory = async () => {
  const data = localStorage.getItem('investmentsData')
  if (!data) return

  const parsedData = JSON.parse(data)
  const uniqueSchemeCodes = [...new Set(parsedData.transactions
    .map((t: Transaction) => t.matchingScheme?.schemeCode)
    .filter(Boolean)
  )]

  console.log('Unique scheme codes:', uniqueSchemeCodes)

  for (const schemeCode of uniqueSchemeCodes) {
    try {
      // Check if we have valid cached data
      const cachedData = await navHistoryDB.get(schemeCode)
      const isCacheValid = cachedData?.timestamp &&
        (Date.now() - cachedData.timestamp < 4 * 60 * 60 * 1000)

      if (isCacheValid) {
        console.log(`Using cached NAV data for scheme ${schemeCode}`)
        continue
      }

      console.log(`Fetching NAV for scheme ${schemeCode}`)
      const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`)
      const navData = await response.json()

      // Store in IndexedDB
      await navHistoryDB.set(schemeCode, navData)
      console.log(`NAV history stored for scheme ${schemeCode}`)

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error fetching NAV for scheme ${schemeCode}:`, error)
    }
  }
}