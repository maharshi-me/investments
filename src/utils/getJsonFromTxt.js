const getJsonFromTxt = t => {
  const lines = t.replace('\r\n', '\n').split('\n')

  const obj = {
    meta: getMeta(lines),
    holder: getHolder(lines),
    summary: getSummary(lines)
    // transactions: getTransactions(lines)
  }

  return obj
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const strToCur = num => Math.round((Number(num.replace(',', '')) + Number.EPSILON) * 100) / 100

const getIndexByText = (lines, text) => lines.indexOf(lines.filter(line => line.substr(0, text.length) === text)[0])

const getTransactions = lines => {
  const filteredLines = lines.filter(line => 
    line !== lines[0] && 
    line !== lines[1] && 
    line !== lines[2] &&
    line.substr(0, 4) !== 'Page' &&
    line.substr(0, 16) !== 'Date Transaction' &&
    line.substr(0, 11) !== '(INR) (INR)'
  )

  return filteredLines
}

const getSummary = lines => {
  const PortfolioSummaryTotalRowIndex = getIndexByText(lines, 'Total')
  const PortfolioSummaryRowIndex = getIndexByText(lines, 'PORTFOLIO SUMMARY')

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
  const mobileNumberRowIndex = getIndexByText(lines, 'Mobile')
  const EmailIdRowIndex = getIndexByText(lines, 'Email Id')

  return {
    name: lines[5],
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
    pageCount: lines.filter(line => line.substr(0, 4) === "Page").length,
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