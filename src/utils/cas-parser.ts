import { InvestmentsData, Meta, Holder, Transaction } from "@/types/investments"

export const textUtils = {
  isText: (str: string) => str.trim().length > 0,
  filterLinesWithText: (lines: string[]) => lines.filter(textUtils.isText),
  excludeLinesThatInclude: (lines: string[], text: string) => lines.filter(line => !line.includes(text)),
  excludeLinesThatStartWith: (lines: string[], text: string) => lines.filter(line => !line.startsWith(text)),
}

export const getFilteredText = (text: string) => {
  const lines = text.split('\n')

  let filteredLines = textUtils.filterLinesWithText(lines)

  filteredLines = textUtils.excludeLinesThatStartWith(filteredLines, 'Page')
  filteredLines = textUtils.excludeLinesThatStartWith(filteredLines, 'Date Amount')
  filteredLines = textUtils.excludeLinesThatStartWith(filteredLines, '(INR) (INR)')
  filteredLines = textUtils.excludeLinesThatStartWith(filteredLines, 'PAN:')

  filteredLines = filteredLines.filter((line, index) => {
    // Keep the line if it's in position 0-2 OR if it doesn't match any of the first 3 lines
    return index <= 2 || ![lines[0], lines[1], lines[2]].includes(line);
  })

  filteredLines.forEach((line, index) => {
    if (line.startsWith('***')) {
      filteredLines[index - 1] += " " + filteredLines[index]
    }
  })

  filteredLines = textUtils.excludeLinesThatStartWith(filteredLines, "***")

  let ci = filteredLines.findIndex(line => line.startsWith('Total')) + 2
  let start = false
  let started = true
  let si

  while (ci <= filteredLines.length - 1) {
    if (start) {
      if (filteredLines[ci].startsWith('Folio No:') && !filteredLines[ci + 1].includes('Folio No:')) {
        start = false
      }
      else {
        filteredLines[si] = filteredLines[si] + " " + filteredLines[ci]
        filteredLines[ci] = ""
      }
    }
    else {
      if (filteredLines[ci].startsWith('Closing') || started) {
        started = true
        if (filteredLines[ci].includes('-')) {
          start = true
          si = ci
          started = false
        }
      }
    }
    ci++
  }

  filteredLines = textUtils.filterLinesWithText(filteredLines)


  // filteredLines.forEach((line, index) => {
  //   if (line.includes("( Non - Demat )")) {
  //     filteredLines[index] = line.split("( Non - Demat )").join('').trim()
  //   }
  // })

  // filteredLines.forEach((line, index) => {
  //   if (line.includes("ISIN :")) {
  //     console.log(line)
  //     filteredLines[index] = line.split('-')[1]
  //     console.log(filteredLines[index])
  //   }
  // })

  // filteredLines.forEach((line, index) => {
  //   if (line.includes("formerly") || line.includes("Formerly")) {
  //     filteredLines[index] = line.split('(')[0].trim()
  //   }
  // })

  filteredLines = filteredLines.filter((line, index) => {
    if (filteredLines[index - 1] && filteredLines[index + 1]) {
      if (line.includes("Nominee 1:")) {
        return false
      }

      if (filteredLines[index - 1].includes("Nominee 1:")) {
        return false
      }

      if (filteredLines[index + 1].includes("Nominee 1:")) {
        return false
      }
    }

    return true
  })

  let newFilteredLines = []
  let read = true

  for (let i = 0; i < filteredLines.length; i++) {
    if (read) {
      newFilteredLines.push(filteredLines[i])
    }

    if (filteredLines[i].includes("Market Value on")) {
      read = false
    }

    if (filteredLines[i].includes("Closing Unit Balance")) {
      newFilteredLines.push(filteredLines[i])
      read = true
    }
  }

  newFilteredLines = textUtils.excludeLinesThatInclude(newFilteredLines, 'Market Value on')

  newFilteredLines = newFilteredLines.filter((_line, index) => {
    if (newFilteredLines[index - 1] && newFilteredLines[index + 2]) {
      if (newFilteredLines[index - 1].includes('Closing Unit Balance')) {
        if (newFilteredLines[index + 2].includes('Folio No: ')) {
          return false
        }
      }
    }

    return true
  })

  newFilteredLines = textUtils.excludeLinesThatInclude(newFilteredLines, 'Closing Unit Balance')

  // bug in pdf
  // If current line starts with Date
    // Check if next line exists and it is date
      // If it is date then dont do anything
      // else then check if next to next line exists and if it starts with Folio No and is
        // If yes then dont do anything
        // else append next line's content to current line with space

  let retry = true
  while(retry) {
    retry = false
    const linesToDelete = []

    newFilteredLines.forEach((line, index) => {
      if (index > 3 && (line.length > 11) && (line[2] === '-') && (line[6] === '-') && (line[11] === ' ') && (newFilteredLines[index + 1])) {
        if ((newFilteredLines[index + 1].length > 11) && (newFilteredLines[index + 1][2] === '-') && (newFilteredLines[index + 1][6] === '-') && (newFilteredLines[index + 1][11] === ' ')) {
        }
        else {
          if (!(newFilteredLines[index + 2] && newFilteredLines[index + 2].startsWith('Folio No: '))) {
            retry = true
            newFilteredLines[index] = newFilteredLines[index] + ' ' + newFilteredLines[index + 1]
            linesToDelete.push(index + 1)
          }
        }
      }
    })

    newFilteredLines = newFilteredLines.filter((v, index) => !(linesToDelete.includes(index)))
  }

  return newFilteredLines.join('\n')
}

export const getJsonFromTxt = async (t: string): Promise<InvestmentsData> => {
  const lines = t.split('\n')

  const transactions = await getTransactions(lines)

  const obj = {
    meta: getMeta(lines),
    holder: getHolder(lines),
    summary: getSummary(lines),
    transactions: transactions
  }

  console.log('obj', obj)

  return obj
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const strToCur = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 100) / 100
export const strToPrice = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 10000) / 10000
export const strToUnits = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 1000) / 1000

export const getIndexByStartingText = (lines: string[], text: string) => lines.indexOf(lines.filter(line => line.startsWith(text))[0])

export const getTransactions = async (lines: string[]): Promise<Transaction[]> => {
  const response = await fetch('https://api.mfapi.in/mf')
  const mfData = await response.json()

  const PortfolioSummaryTotalRowIndex = getIndexByStartingText(lines, 'Total')

  let filteredLines = lines.filter((_line, index) => index > PortfolioSummaryTotalRowIndex + 1)

  filteredLines.forEach((line, index) => {
    if (line.includes("*** Stamp Duty ***")) {
      const stampDuty = strToPrice(line.split(" ")[1])
      const amount = strToPrice(filteredLines[index - 1].split(" ")[1])

      filteredLines[index - 1] = filteredLines[index - 1].split(" ")
      filteredLines[index - 1][1] = (amount + stampDuty).toFixed(2)
      filteredLines[index - 1] = filteredLines[index - 1].join(" ")
    }
  })

  filteredLines = filteredLines.filter(line => !line.includes("***"))

  filteredLines.forEach((line, index) => {
    if (line.startsWith('Folio No:')) {
      filteredLines[index - 1] += " " + line
    }
  })

  filteredLines = filteredLines.filter(line => !line.startsWith('Folio No:'))

  let mfNameFull: string, mfName: string, folio: string, isin: string, matchingScheme: any

  filteredLines.forEach((line, index) => {
    if (line.includes('Folio No:')) {
      [ mfNameFull, folio ] = line.split(" Folio No: ")
      isin = line.split(' - ISIN : ')[1].split("(")[0].split('Registrar')[0].split(' ').join('').trim()

      if (!isin) {
        console.log('No ISIN found for line:', line)
        throw new Error(`No ISIN found for line: ${line}`)
      }

      matchingScheme = mfData.find(scheme =>
        scheme.isinGrowth === isin || scheme.isinDivReinvestment === isin
      )

      if (!matchingScheme) {
        console.log('No matching scheme found for ISIN:', isin)
        throw new Error(`No matching scheme found for ISIN: ${isin}`)
      }

      mfNameFull = mfNameFull.split(' - ISIN : ')[0].trim()
      mfNameFull = mfNameFull.split(" -").splice(1).join(" -").trim()

      mfName = mfNameFull.split('Direct').join('').split('DIRECT').join('').split('Growth').join('').split('GROWTH').join('')
        .split('Plan').join('').split('PLAN').join('').split('Option').join('').split('OPTION').join('')
        .split('( Non - Demat )').join('').split('( formerly')[0].trim()

      while (mfName.charAt( mfName.length-1 ) === "-" || mfName.charAt( mfName.length-1 ) === " ") {
        mfName = mfName.slice(0, -1)
      }
    }
    else {
      if (line[2] === '-') {
        let amount, units
        const amountStr = line.split(" ")[1]
        const unitsStr = line.split(" ")[3]
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
          isin,
          matchingScheme,
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
    }
  })

  filteredLines = filteredLines.filter(line => typeof(line) !== 'string')

  filteredLines = filteredLines.filter(line => isNaN(line.amount) === false)

  return filteredLines
}

export const getSummary = (lines: string[]) => {
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

export const getHolder = (lines: string[]): Holder => {
  const mobileNumberRowIndex = getIndexByStartingText(lines, 'Mobile')
  const EmailIdRowIndex = getIndexByStartingText(lines, 'Email Id')

  return {
    name: lines[4],
    email: lines[EmailIdRowIndex].split(' ')[2],
    mobile: lines[mobileNumberRowIndex].split(' ')[1],
    address: lines.slice(EmailIdRowIndex + 2, mobileNumberRowIndex).join('\n')
  }
}

const convertDateToString = (date: Date): string => {
  return JSON.parse(JSON.stringify(date))
}

export const getMeta = (lines: string[]): Meta => {
  const timestamp = lines[0].split(' ')[0].split('-')[1]
  const from = lines[2].split(' ')[0].split('-')
  const to = lines[2].split(' ')[2].split('-')

  return {
    exportedAt: convertDateToString(new Date(
      Number('20' + timestamp.substr(4,2)),
      Number(timestamp.substr(2,2) - 1),
      Number(timestamp.substr(0,2)),
      Number(timestamp.substr(6,2)),
      Number(timestamp.substr(8,2)),
      Number(timestamp.substr(10,2))
    )),
    from: convertDateToString(new Date(Number(from[2]), MONTHS.indexOf(from[1]), Number(from[0]))),
    to: convertDateToString(new Date(Number(to[2]), MONTHS.indexOf(to[1]), Number(to[0])))
  }
}
