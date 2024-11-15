import { useEffect, useState } from 'react'
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'

import getJsonFromTxt from 'utils/getJsonFromTxt'
import {
  isLineStartsWith,
  getIndexByStartingText,
  isLineIncludes
} from 'utils/helperFunctions'

GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.js`

function CAS() {
  const [ cas, setCas ] = useState()

  useEffect(() => {
    extractTextFromPDF()
      .then(text => {
        setCas(getJsonFromTxt(filterText(text)))
      })

  }, [])

  return cas
}

const filterText = text => {
  const lines = text.split('\n')

  let filteredLines = filterLinesWithText(lines)

  filteredLines = filteredLines.filter(line =>
    !isLineStartsWith(line, 'Page') &&
    !isLineStartsWith(line, 'Date Amount') &&
    !isLineStartsWith(line, '(INR) (INR)') &&
    !isLineStartsWith(line, 'PAN:')
  )

  filteredLines = filteredLines.filter((line, index) => (index === 0) || (line !== lines[0]))
  filteredLines = filteredLines.filter((line, index) => (index === 1) || (line !== lines[1]))
  filteredLines = filteredLines.filter((line, index) => (index === 2) || (line !== lines[2]))

  filteredLines.forEach((line, index) => {
    if (isLineStartsWith(line, '***')) {
      filteredLines[index - 1] += " " + filteredLines[index]
    }
  })

  filteredLines = filteredLines.filter(line => !isLineStartsWith(line, "***"))

  let ci = getIndexByStartingText(filteredLines, 'Total') + 2
  let start = false
  let started = true
  let si

  while (ci <= filteredLines.length - 1) {
    if (start) {
      if (isLineStartsWith(filteredLines[ci], 'Folio No:') && !isLineIncludes(filteredLines[ci + 1], 'Folio No:')) {
        start = false
      }
      else {
        filteredLines[si] = filteredLines[si] + " " + filteredLines[ci]
        filteredLines[ci] = ""
      }
    }
    else {
      if (isLineStartsWith(filteredLines[ci], 'Closing') || started) {
        started = true
        if (isLineIncludes(filteredLines[ci], '-')) {
          start = true
          si = ci
          started = false
        }
      }
    }
    ci++
  }

  filteredLines = filterLinesWithText(filteredLines)


  filteredLines.forEach((line, index) => {
    if (line.includes("( Non - Demat )")) {
      filteredLines[index] = line.split("( Non - Demat )").join('').trim()
    }
  })

  filteredLines.forEach((line, index) => {
    if (line.includes("ISIN :")) {
      filteredLines[index] = line.split('-')[1]
    }
  })

  filteredLines.forEach((line, index) => {
    if (line.includes("formerly") || line.includes("Formerly")) {
      filteredLines[index] = line.split('(')[0].trim()
    }
  })

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

  newFilteredLines = excludeLinesThatInclude(newFilteredLines, 'Market Value on')

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

  newFilteredLines = excludeLinesThatInclude(newFilteredLines, 'Closing Unit Balance')

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
    let linesToDelete = []

    newFilteredLines.forEach((line, index) => {
      if (index > 3 && (line.length > 11) && (line[2] === '-') && (line[6] === '-') && (line[11] === ' ') && (newFilteredLines[index + 1])) {
        if ((newFilteredLines[index + 1].length > 11) && (newFilteredLines[index + 1][2] === '-') && (newFilteredLines[index + 1][6] === '-') && (newFilteredLines[index + 1][11] === ' ')) {
        }
        else {
          if (!(newFilteredLines[index + 2] && isLineStartsWith(newFilteredLines[index + 2], 'Folio No: '))) {
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

async function extractTextFromPDF() {
  const loadingTask = getDocument({
    url: process.env.REACT_APP_PDF_PATH,
    password: process.env.REACT_APP_PDF_PASSWORD
  })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  let text = ''

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const pageText = await page.getTextContent()

    pageText.items.forEach(item => {
      if (item.hasEOL) {
        if (isText(item.str)) {
          text += item.str + '\n'
        }
        else {
          text += '\n'
        }
      }
      else {
        if (isText(item.str)) {
          text += item.str + ' '
        }
      }
    })
    text += '\n'
  }

  return text.split('\n').map(line => line.trim()).join('\n')
}

const isText = str => str !== '' && str !== ' '

const filterLinesWithText = lines => lines.filter(line => isText(line))

const excludeLinesThatInclude = (lines, text) => lines.filter(line => !line.includes(text))

export default CAS
