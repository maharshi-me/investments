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
    extractTextFromPDF({
      url: process.env.REACT_APP_PDF_PATH,
      password: process.env.REACT_APP_PDF_PASSWORD
    })
      .then(text => {
        const filteredText = filterText(text)
        const casJson = getJsonFromTxt(filteredText)
        setCas(casJson)
      })

  }, [])

  return cas
}

const filterText = text => {
  const lines = text.split('\n')

  let filteredLines = lines.filter(line => {
    if (!isText(line)) {
      return false
    }

    return true
  })

  filteredLines = filteredLines.filter(line => 
    !isLineStartsWith(line, 'Page') &&
    !isLineStartsWith(line, 'Date Amount') &&
    !isLineStartsWith(line, '(INR) (INR)') &&
    !isLineStartsWith(line, 'PAN:')
  )

  filteredLines = filteredLines.filter((line, index) => {
    if (index === 0) {
      return true
    }

    if (line !== lines[0]) {
      return true
    }

    return false
  })

  filteredLines = filteredLines.filter((line, index) => {
    if (index === 1) {
      return true
    }
    
    if (line !== lines[1]) {
      return true
    }

    return false
  })

  filteredLines = filteredLines.filter((line, index) => {
    if (index === 2) {
      return true
    }
    
    if (line !== lines[2]) {
      return true
    }

    return false
  })

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

  filteredLines = filteredLines.filter(line => isText(line))
  

  filteredLines.forEach((line, index) => {
    if (line.includes("Registrar :")) {
      filteredLines[index] = line.split('-').slice(1).join('-').trim()
    }
  })
  
  filteredLines.forEach((line, index) => {
    if (line.includes("Registrar :")) {
      filteredLines[index] = line.split('-').slice(0, -1).join('-').trim()
    }
  })

  filteredLines.forEach((line, index) => {
    if (line.includes("formerly")) {
      filteredLines[index] = line.split('(').slice(0, -1).join('').trim()
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
  
  newFilteredLines = excludeLineThatIncludes(newFilteredLines, 'Market Value on')

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

  newFilteredLines = excludeLineThatIncludes(newFilteredLines, 'Closing Unit Balance')

  return newFilteredLines.join('\n')
}

async function extractTextFromPDF(pdfPath) {
  const loadingTask = getDocument(pdfPath)
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
      } else {
        if (isText(item.str)) {
          text += item.str + ' '
        }
      }
      
    })
    text += '\n'
  }

  return text.split('\n').map(line => line.trim()).join('\n')
}

const isText = str => str != '' && str != ' '

const excludeLineThatIncludes = (lines, text) => lines.filter(line => !line.includes(text))

export default CAS
