import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TypographySmall } from "@/components/ui/typography-small"
import { useTheme } from "@/components/theme-provider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { useNavigate } from "react-router-dom"

GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

const textUtils = {
  isText: (str: string) => str.trim().length > 0,
  filterLinesWithText: (lines: string[]) => lines.filter(textUtils.isText),
  excludeLinesThatInclude: (lines: string[], text: string) => lines.filter(line => !line.includes(text)),
  excludeLinesThatStartWith: (lines: string[], text: string) => lines.filter(line => !line.startsWith(text)),
}

const getFilteredText = (text: string) => {
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
    let linesToDelete = []

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

const getIndexByStartingText = (lines, text) => lines.indexOf(lines.filter(line => line.startsWith(text))[0])

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
    if (line.startsWith('Folio No:')) {
      filteredLines[index - 1] += " " + line
    }
  })

  filteredLines = filteredLines.filter(line => !line.startsWith('Folio No:'))

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
      if (line[2] === '-') {
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


export default function SwitchDemo() {
  const { theme, setTheme } = useTheme()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [json, setJson] = useState<any>(null)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [hasExistingData, setHasExistingData] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const data = localStorage.getItem('investmentsData')
    if (data) {
      setHasExistingData(true)
      const parsedData = JSON.parse(data)
      setJson(parsedData)
    }
  }, [])

  const changeTheme = (checked: boolean) => {
    if (checked) {
      setTheme("dark")
    }
    else{
      setTheme("light")
    }
  }

  const checkIfPasswordProtected = async (file: File) => {
    try {
      const blobUrl = URL.createObjectURL(file)
      const loadingTask = getDocument({
        url: blobUrl,
      })
      await loadingTask.promise
      setIsPasswordProtected(false)
      setPassword("")
      URL.revokeObjectURL(blobUrl)
    } catch (err: any) {
      if (err.name === 'PasswordException') {
        setIsPasswordProtected(true)
        setPassword("FECPM2625L") // Set default password for protected files
      }
      URL.revokeObjectURL(blobUrl)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file)
        setError("")
        checkIfPasswordProtected(file)
      } else {
        alert('Please upload a PDF file')
        e.target.value = ''
      }
    }
  }

  const handleViewFile = async () => {
    if (selectedFile) {
      try {
        const blobUrl = URL.createObjectURL(selectedFile)
        const loadingTask = getDocument({
          url: blobUrl,
          password: password
        })
        const pdf = await loadingTask.promise
        const numPages = pdf.numPages
        let text = ''

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const pageText = await page.getTextContent()

          pageText.items.forEach(item => {
            if (item.hasEOL) {
              if (textUtils.isText(item.str)) {
                text += item.str + '\n'
              }
              else {
                text += '\n'
              }
            }
            else {
              if (textUtils.isText(item.str)) {
                text += item.str + ' '
              }
            }
          })
          text += '\n'
        }

        text = text.split('\n').map(line => line.trim()).join('\n')

        const filteredText = getFilteredText(text)

        const json = getJsonFromTxt(filteredText)

        setJson(json)
        localStorage.setItem('investmentsData', JSON.stringify(json))
        setShowSuccess(true)
        setError("")
        URL.revokeObjectURL(blobUrl)

        // Reset form
        setSelectedFile(null)
        setPassword("")
        setIsPasswordProtected(false)
        setHasExistingData(true)

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''

        // Show success toast
        toast({
          title: "Success!",
          description: `${json.transactions.length} transactions imported successfully.`,
          action: (
            <ToastAction altText="View transactions" onClick={() => navigate('/transactions')}>
              View
            </ToastAction>
          ),
        })

      } catch (err: any) {
        console.log(err)
        if (err.name === 'PasswordException') {
          setError("Invalid password. Please try again.")
        }
        else {
          setError("An error occurred while processing the file.")
        }
        toast({
          variant: "destructive",
          title: "Error",
          description: err.name === 'PasswordException'
            ? "Invalid password. Please try again."
            : "An error occurred while processing the file.",
        })
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <TypographySmall text="Theme" />
        <div className="p-4 pt-0" />
        <div className="flex items-center space-x-2">
          <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={changeTheme}/>
          <Label htmlFor="dark-mode">Dark Mode</Label>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between max-w-sm">
            <TypographySmall text="CAS Import" />
            {hasExistingData && (
              <TypographySmall
                text={`Last imported: ${json?.transactions?.length} transactions`}
                className="text-muted-foreground"
              />
            )}
          </div>
          <div className="p-4 pt-0" />
          <div className="flex flex-col gap-4">
            {hasExistingData && (
              <div className="rounded-lg border p-4 max-w-sm">
                <div className="flex flex-col gap-2">
                  <TypographySmall text="Current Data" />
                  <div className="text-sm text-muted-foreground">
                    <div>From: {new Date(json?.meta?.from).toLocaleDateString()}</div>
                    <div>To: {new Date(json?.meta?.to).toLocaleDateString()}</div>
                    <div>Exported: {new Date(json?.meta?.exportedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
            <Input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="max-w-sm"
            />
            {selectedFile && (
              <>
                {isPasswordProtected && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="pdf-password">PDF Password</Label>
                    <div className="relative max-w-sm">
                      <Input
                        id="pdf-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter PDF password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                {error && (
                  <span className="text-sm text-red-500">{error}</span>
                )}
                <Button
                  onClick={handleViewFile}
                  className="max-w-sm"
                  disabled={isPasswordProtected && !password}
                >
                  {hasExistingData ? 'Update Data' : 'Import'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
