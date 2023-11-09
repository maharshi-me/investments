import byDateAsc from 'utils/functions/byDateAsc'

function getAllDatesList(startDate, endDate) {
  const dates = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(currentDate.toLocaleDateString('en-IN',{ year:"numeric", month:"short", day: '2-digit'}))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

function getAllDateObjsList(startDate, endDate) {
  const dates = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

const getInvestments = transactions => {
  let ts = transactions.slice()
  ts.sort(byDateAsc)

  let endDate = new Date()
  const startDate = ts.length > 0 ? new Date(ts[0].date) : endDate

  let allDatesList = getAllDatesList(startDate, endDate)
  let allDateObjsList = getAllDateObjsList(startDate, endDate)

  let data = [{
    date: allDatesList[0],
    dateObj: allDateObjsList[0],
    invested: 0
  }]

  let currentIndex = 0

  for (let i = 0; i < ts.length; i++) {
    let t = ts[i]

    const transactionDateString = new Date(t.date).toLocaleDateString('en-IN',{ year:"numeric", month:"short", day: '2-digit'})

    while(transactionDateString !== allDatesList[currentIndex]) {
      currentIndex += 1

      data.push({
        date: allDatesList[currentIndex],
        dateObj: allDateObjsList[currentIndex],
        invested: data[currentIndex - 1].invested
      })
    }

    data[currentIndex].invested = (t.type === "Investment")
      ? (data[currentIndex].invested + t.amount)
      : (data[currentIndex].invested - t.amount)
  }

  while (currentIndex !== allDatesList.length - 1){
    currentIndex += 1

    data.push({
      date: allDatesList[currentIndex],
      dateObj: allDateObjsList[currentIndex],
      invested: data[currentIndex - 1].invested
    })
  }

  return data
}

export default getInvestments
