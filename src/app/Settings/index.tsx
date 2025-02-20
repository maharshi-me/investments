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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"
import { Trash2Icon } from "lucide-react"
import { Loader2Icon } from "lucide-react"
import { textUtils, getFilteredText, getJsonFromTxt } from "@/utils/cas-parser"
import { setPageTitle } from "@/utils/page-title"
import { navHistoryDB } from "@/utils/db"
import { fetchNavHistory } from "@/utils/nav-fetcher"

GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

export default function SwitchDemo() {
  const { theme, setTheme } = useTheme()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [json, setJson] = useState<any>(null)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [hasExistingData, setHasExistingData] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('investmentsData')
    if (data) {
      setHasExistingData(true)
      const parsedData = JSON.parse(data)
      setJson(parsedData)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setPageTitle("Settings")
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
        setPassword("") // Set default password for protected files
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
      setIsProcessing(true)
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

        const json = await getJsonFromTxt(filteredText)

        // Clear existing IndexedDB data before storing new data
        await navHistoryDB.clear()

        setJson(json)
        localStorage.setItem('investmentsData', JSON.stringify(json))

        // Fetch fresh NAV data
        await fetchNavHistory()

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

        setIsProcessing(false)
      } catch (err: any) {
        console.log(err)
        if (err.name === 'PasswordException') {
          setError("Invalid password. Please try again.")
        }
        else if (err.message) {
          setError(err.message)
        }
        else {
          setError("An error occurred while processing the file.")
        }
        setIsProcessing(false)
      }
    }
  }

  const handleClearData = async () => {
    // Clear localStorage
    localStorage.removeItem('investmentsData')
    // Clear IndexedDB
    await navHistoryDB.clear()
    setJson(null)
    setHasExistingData(false)
    toast({
      title: "Data cleared",
      description: "All imported data has been removed.",
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <TypographySmall text="Theme" />
        <div className="p-4 pt-0" />
        <div className="flex items-center space-x-2">
          <Label htmlFor="dark-mode">Light</Label>
          <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={changeTheme}/>
          <Label htmlFor="dark-mode">Dark</Label>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between max-w-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <TypographySmall text="CAS Import" />
                    <InfoIcon className="h-3 w-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">How to download CAS PDF:</p>
                    <ol className="text-sm list-decimal ml-4 space-y-1">
                      <li>Visit{" "}
                        <a
                          href="https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          CAMS Online
                        </a>
                      </li>
                      <li>Select "Detailed" statement type</li>
                      <li>Set "From Date" to when you started investing</li>
                      <li>Set "To Date" as today</li>
                      <li>Choose "With Zero Balance Folios" in Folio Listing Type</li>
                      <li>Enter your email and create a password</li>
                      <li>Submit the form</li>
                    </ol>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {isLoading ? (
              <div className="rounded-lg border p-4 max-w-sm flex items-center justify-center">
                <Loader2Icon className="h-4 w-4 animate-spin" />
              </div>
            ) : hasExistingData && (
              <TypographySmall
                text={`Last imported: ${json?.transactions?.length} transactions`}
                className="text-muted-foreground"
              />
            )}
          </div>
          <div className="p-4 pt-0" />
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="rounded-lg border p-4 max-w-sm flex items-center justify-center">
                <Loader2Icon className="h-4 w-4 animate-spin" />
              </div>
            ) : hasExistingData && (
              <div className="rounded-lg border p-4 max-w-sm">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <TypographySmall text="Current Data" />
                    <div className="text-sm text-muted-foreground">
                      <div>From: {new Date(json?.meta?.from).toLocaleDateString()}</div>
                      <div>To: {new Date(json?.meta?.to).toLocaleDateString()}</div>
                      <div>Exported: {new Date(json?.meta?.exportedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearData}
                    className="h-8 w-8"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <Input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="max-w-sm"
              disabled={isProcessing}
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
                        disabled={isProcessing}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isProcessing}
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
                  disabled={isProcessing || (isPasswordProtected && !password)}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : hasExistingData ? (
                    'Update Data'
                  ) : (
                    'Import'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
