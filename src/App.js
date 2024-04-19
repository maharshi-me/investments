import { BrowserRouter, Routes, Route } from "react-router-dom"

import CAS from 'utils/CAS'
import Dashboard from "pages/Dashboard"
import Layout from "Layout"
import Portfolio from "pages/Portfolio"
import Transactions from 'pages/Transactions'
import Profile from "pages/Profile"
import Cache from "pages/Cache"
import { getURL } from "constants";

import byDateDesc from 'utils/functions/byDateDesc'

const callAPI = async (key, url, firstDate) => {
  try {
    const response = await fetch(url)
    let apiData = await response.json()
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

  mfNames.forEach(mfName => {
    const url = getURL(mfName)
    const firstMfTransaction = transactions.filter(({ mfName: mfN }) => mfN === mfName).pop()
    const firstDate = new Date(firstMfTransaction.date).toLocaleDateString("es-CL")

    if (url) {
      let item = localStorage.getItem(mfName)

      if (!item) {
        callAPI(mfName, url, firstDate)
      }
      else {
        item = JSON.parse(item)

        if (((Date.now() - item.lastSyncedAt) / 1000) > 10000) {
          callAPI(mfName, url)
        }
      }
    }
  })
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
