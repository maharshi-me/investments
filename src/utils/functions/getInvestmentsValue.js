import byDateAsc from 'utils/functions/byDateAsc'

const getInvestmentsValue = transactions => {
  let ts = transactions.slice()
  ts.sort(byDateAsc)

  let mfItemsNamesList = []

  for (let i = 0; i < transactions.length; i++) {
    if (mfItemsNamesList.indexOf(transactions[i].mfName) === -1) {
      mfItemsNamesList.push(transactions[i].mfName)
    }
  }

  let mfItems = mfItemsNamesList.map((v, i) => ({
    mfName: v
  }))
  
  // save mf transactions and empty date objs
  for (let i = 0; i < mfItems.length; i++) {
    let ts = transactions.filter(t => t.mfName === mfItems[i].mfName)
    const startDate = new Date(ts[ts.length - 1].date)
    let endDate = new Date()
    endDate.setDate(endDate.getDate() - 1)
    mfItems[i].dates = []
    let currentDate = new Date(startDate)
  
    while (currentDate <= endDate) {
      let dateName = currentDate.toLocaleDateString('en-IN',{ year:"numeric", month:"2-digit", day: '2-digit'}).replace(/\//g, '-')
      let dateNameDisplay = currentDate.toLocaleDateString('en-IN',{ year:"numeric", month:"short", day: '2-digit'})
      let dateObj = new Date(currentDate)
      mfItems[i].dates.push({
        dateForSearch: dateName,
        date: dateNameDisplay,
        dateObj: dateObj
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    mfItems[i].transactions = ts
  }

  // save units of each date based on transactions
  for (let i = 0; i < mfItems.length; i++) {
    let cumulativeUnits = 0

    for (let j = 0; j < mfItems[i].dates.length; j++) {
      let transactionsOnDate = mfItems[i].transactions.filter(t => new Date(t.date).getTime() == mfItems[i].dates[j].dateObj.getTime())
      for (let k = 0; k < transactionsOnDate.length; k++) {
        if (transactionsOnDate[k].type === 'Investment'){
          cumulativeUnits = cumulativeUnits + transactionsOnDate[k].units
        }
        else {
          cumulativeUnits = cumulativeUnits - transactionsOnDate[k].units
        }
      }
      mfItems[i].dates[j].units = cumulativeUnits
    }
  }

  // Get Nav on each date and save the value
  for (let i = 0; i < mfItems.length; i++) {
    let data = localStorage.getItem(mfItems[i].mfName)
    if (data) {
      data = JSON.parse(data)
    }
    for (let j = 0; j < mfItems[i].dates.length; j++) {
      let navOnDate = data?.data?.find(k => k.date === mfItems[i].dates[j].dateForSearch)
      if (navOnDate) {
        mfItems[i].dates[j].value = Number(navOnDate.nav) * mfItems[i].dates[j].units
      }
      else if (mfItems[i].dates[j - 1]?.value) {
        mfItems[i].dates[j].value = mfItems[i].dates[j - 1].value
      }
      else {
        mfItems[i].dates[j].value = null
      }
    }
  }

  let investmentsData = []
  if (transactions.length > 0) {
    const startDate = new Date(transactions[transactions.length - 1].date)
    let endDate = new Date()
    endDate.setDate(endDate.getDate() - 1)
    let currentDate = new Date(startDate)
  
    while (currentDate <= endDate) {
      let dateName = currentDate.toLocaleDateString('en-IN',{ year:"numeric", month:"short", day: '2-digit'})
      let dateObj = new Date(currentDate)
      investmentsData.push({
        date: dateName,
        dateObj: dateObj,
        value: 0
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
  
    for (let i = 0; i < mfItems.length; i++) {
      for (let j = 0; j < mfItems[i].dates.length; j++) {
        let dateItem = investmentsData.find(k => k.date === mfItems[i].dates[j].date)
        dateItem.value = dateItem.value + mfItems[i].dates[j].value
      }
    }
  }

  return investmentsData
}

const getCachedInvestmentsValue = transactions => {
  let investmentsValueObj = localStorage.getItem('investments-value')

  if (!investmentsValueObj) {
    investmentsValueObj = {
      data: getInvestmentsValue(transactions)
    }

    if (investmentsValueObj.data.length) {
      investmentsValueObj.lastSyncedAt = Date.now()
      localStorage.setItem('investments-value', JSON.stringify(investmentsValueObj))
    }
  }
  else {
    investmentsValueObj = JSON.parse(investmentsValueObj)

    if (((Date.now() - investmentsValueObj.lastSyncedAt) / 1000) > 10000) {
      investmentsValueObj = {
        data: getInvestmentsValue(transactions)
      }

      if (investmentsValueObj.data.length) {
        investmentsValueObj.lastSyncedAt = Date.now()
        localStorage.setItem('investments-value', JSON.stringify(investmentsValueObj))
      }
    }
  }

  return investmentsValueObj.data
}

export default getCachedInvestmentsValue
