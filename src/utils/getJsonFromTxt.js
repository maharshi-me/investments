import { isLineStartsWith } from "utils/helperFunctions"

const getJsonFromTxt = t => {
  const lines = t.split('\n')

  const obj = {
    meta: getMeta(lines),
    holder: getHolder(lines),
    summary: getSummary(lines),
    transactions: getTransactions(lines)
  }

  return obj
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const strToCur = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 100) / 100
const strToPrice = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 10000) / 10000
const strToUnits = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 1000) / 1000

const getIndexByStartingText = (lines, text) => lines.indexOf(lines.filter(line => isLineStartsWith(line, text))[0])

const getTransactions = lines => {
  const PortfolioSummaryTotalRowIndex = getIndexByStartingText(lines, 'Total')

  let filteredLines = lines.filter((_line, index) => index > PortfolioSummaryTotalRowIndex + 1)

  filteredLines.forEach((line, index) => {
    if (line.includes("*** Stamp Duty ***")) {
      let stampDuty = strToPrice(line.split(" ")[1])
      let amount = strToPrice(filteredLines[index - 1].split(" ")[1])

      filteredLines[index - 1] = filteredLines[index - 1].split(" ")
      filteredLines[index - 1][1] = (amount + stampDuty).toFixed(2)
      filteredLines[index - 1] = filteredLines[index - 1].join(" ")
    }
  })

  filteredLines = filteredLines.filter(line => !line.includes("***"))

  filteredLines.forEach((line, index) => {
    if (isLineStartsWith(line, 'Folio No:')) {
      filteredLines[index - 1] += " " + line
    }
  })

  filteredLines = filteredLines.filter(line => !isLineStartsWith(line, 'Folio No:'))

  let mfNameFull, mfName, folio

  filteredLines.forEach((line, index) => {
    if (line.includes('Folio No:')) {
      [ mfNameFull, folio ] = line.split(" Folio No: ")
      mfName = mfNameFull.split('Direct').join('').split('DIRECT').join('').split('Growth').join('').split('GROWTH').join('')
        .split('Plan').join('').split('PLAN').join('').split('Option').join('').split('OPTION').join('').trim()

      while (mfName.charAt( mfName.length-1 ) === "-" || mfName.charAt( mfName.length-1 ) === " ") {
        mfName = mfName.slice(0, -1)
      }
    }
    else {
      let amount, units
      let amountStr = line.split(" ")[1]
      let unitsStr = line.split(" ")[3]
      let type = 'Investment'

      if (amountStr[0] === '(') {
        amount = strToCur(amountStr.slice(1, -1))
        type = "Redemption"
      }
      else {
        amount = strToCur(amountStr)
      }

      if (unitsStr[0] === '(') {
        units = strToUnits(unitsStr.slice(1, -1))
      }
      else {
        units = strToUnits(unitsStr)
      }

      folio = folio.split("/")[0].trim()

      filteredLines[index] = {
        mfNameFull,
        mfName,
        folio,
        date: new Date(
          Number(line.split(" ")[0].split("-")[2]),
          MONTHS.indexOf(line.split(" ")[0].split("-")[1]),
          Number(line.split(" ")[0].split("-")[0])
        ),
        amount,
        type,
        price: strToPrice(line.split(" ")[2]),
        units,
        content: line,
        key: index
      }
    }
  })

  filteredLines = filteredLines.filter(line => typeof(line) !== 'string')

  return filteredLines
}

const getSummary = lines => {
  const PortfolioSummaryTotalRowIndex = getIndexByStartingText(lines, 'Total')
  const PortfolioSummaryRowIndex = getIndexByStartingText(lines, 'PORTFOLIO SUMMARY')

  return {
    invested: strToCur(lines[PortfolioSummaryTotalRowIndex].split(' ')[1]),
    currentValue: strToCur(lines[PortfolioSummaryTotalRowIndex].split(' ')[2]),
    mutualFunds: lines.slice(PortfolioSummaryRowIndex + 1, PortfolioSummaryTotalRowIndex).map(
      mf => {
        const mf_s = mf.trim().split(' ')

        return {
          fundHouse: mf_s.slice(0, mf_s.length - 2).join(' '),
          invested: strToCur(mf_s[mf_s.length - 2]),
          currentValue: strToCur(mf_s[mf_s.length - 1])
        }
      }
    )
  }
}

const getHolder = lines => {
  const mobileNumberRowIndex = getIndexByStartingText(lines, 'Mobile')
  const EmailIdRowIndex = getIndexByStartingText(lines, 'Email Id')

  return {
    name: lines[4],
    email: lines[EmailIdRowIndex].split(' ')[2],
    mobile: lines[mobileNumberRowIndex].split(' ')[1],
    address: lines.slice(EmailIdRowIndex + 2, mobileNumberRowIndex).join('\n')
  }
}

const getMeta = lines => {
  const timestamp = lines[0].split(' ')[0].split('-')[1]
  const from = lines[2].split(' ')[0].split('-')
  const to = lines[2].split(' ')[2].split('-')

  return {
    exportedAt: new Date(
      Number('20' + timestamp.substr(4,2)),
      Number(timestamp.substr(2,2) - 1),
      Number(timestamp.substr(0,2)),
      Number(timestamp.substr(6,2)),
      Number(timestamp.substr(8,2)),
      Number(timestamp.substr(10,2))
    ),
    from: new Date(Number(from[2]), MONTHS.indexOf(from[1]), Number(from[0])),
    to: new Date(Number(to[2]), MONTHS.indexOf(to[1]), Number(to[0]))
  }
}

export default getJsonFromTxt