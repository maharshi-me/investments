import { BrowserRouter, Routes, Route } from "react-router-dom"

import Cache from "pages/Cache"
import CAS from 'utils/CAS'
import Dashboard from "pages/Dashboard"
import Layout from "Layout"
import Portfolio from "pages/Portfolio"
import Profile from "pages/Profile"
import Transactions from 'pages/Transactions'
import { getURL } from "constants";

import byDateDesc from 'utils/functions/byDateDesc'

const callAPI = async (key, searchKey, firstDate) => {
  try {
    let OldConstantsData = localStorage.getItem('constants_' + key)

    if (OldConstantsData) {
      OldConstantsData = JSON.parse(OldConstantsData)
    }

    let schemeCode = null

    if (OldConstantsData?.selectedSchemeCode) {
      schemeCode = OldConstantsData.selectedSchemeCode
    }
    else {
      if (!OldConstantsData?.searchData?.length) {
        const searchResponse = await fetch("https://api.mfapi.in/mf/search?" + new URLSearchParams({ q: searchKey }))
        const searchData = await searchResponse.json()

        if (searchData.length === 1) {
          schemeCode = searchData[0].schemeCode
        }

        const constantsData = {
          selectedSchemeCode: schemeCode,
          searchData
        }

        localStorage.setItem('constants_' + key, JSON.stringify(constantsData))
      }
    }

    if (schemeCode) {
      const response = await fetch("https://api.mfapi.in/mf/" + schemeCode)
      const apiData = await response.json()
      let data = []

      apiData.data.every((element) => {
        data.push(element)
        if (element.date === firstDate) return false
        else return true
      })

      const cacheData = {
        data: data,
        lastSyncedAt: Date.now()
      }

      localStorage.setItem(key, JSON.stringify(cacheData))
    }
  } catch (err) {
    console.log(err)
  }
}

const getCAS = () => {
  let cas = localStorage.getItem('cas')

  if (!cas) {
    cas = CAS()

    if (cas) {
      cas.lastSyncedAt = Date.now()
      localStorage.setItem('cas', JSON.stringify(cas))
    }
  }
  else {
    cas = JSON.parse(cas)

    if (((Date.now() - cas.lastSyncedAt) / 1000) > 10000) {
      cas = CAS()

      if (cas) {
        cas.lastSyncedAt = Date.now()
        localStorage.setItem('cas', JSON.stringify(cas))
      }
    }
  }
  let { transactions = [] } = cas || {}
  transactions.sort(byDateDesc)

  const mfNames = Array.from(new Set(transactions.map(({ mfName }) => mfName)))

  mfNames.forEach((mfName) => {
    const mfNameFull = transactions.find(({ mfName: mName }) => mName === mfName).mfNameFull
    const url = getURL(mfName)
    const firstMfTransaction = transactions.filter(({ mfName: mfN }) => mfN === mfName).pop()
    const firstDate = new Date(firstMfTransaction.date).toLocaleDateString("es-CL")

    if (url) {
      let item = localStorage.getItem(mfName)

      if (!item) {
        callAPI(mfName, mfNameFull, firstDate)
      }
      else {
        item = JSON.parse(item)

        if (((Date.now() - item.lastSyncedAt) / 1000) > 10000) {
          callAPI(mfName, mfNameFull, firstDate)
        }
      }
    }
  })

  return cas
}

function App() {
  const cas = getCAS()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard cas={cas} />} />
          <Route path="portfolio" element={<Portfolio cas={cas} />} />
          <Route path="transactions" element={<Transactions cas={cas} />} />
          <Route path="profile" element={<Profile cas={cas} />} />
          <Route path="cache" element={<Cache />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
