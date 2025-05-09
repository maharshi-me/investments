import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist'
import { TextItem } from "pdfjs-dist/types/src/display/api"
import { Trash2Icon, Loader2Icon, EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { fetchNavHistory } from "@/utils/nav-fetcher"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { textUtils, getFilteredText, getJsonFromTxt } from "@/utils/cas-parser"
import { ToastAction } from "@/components/ui/toast"
import { TypographySmall } from "@/components/ui/typography-small"
import { useTheme } from "@/components/theme-provider"
import { useToast } from "@/hooks/use-toast"

import { Meta, Transaction } from "@/types/investments"

GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

export default function Settings({ meta, transactions, readData }: { meta?: Meta, transactions: Transaction[], readData: () => void }) {
  const { theme, setTheme } = useTheme()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const checkIfPasswordProtected = async (file: File) => {
    const blobUrl = URL.createObjectURL(file)
    try {
      const loadingTask = getDocument({
        url: blobUrl,
      })
      await loadingTask.promise
      setIsPasswordProtected(false)
      setPassword("")
      URL.revokeObjectURL(blobUrl)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'PasswordException') {
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
            const textItem = item as TextItem
            if (textItem.hasEOL) {
              if (textUtils.isText(textItem.str)) {
                text += textItem.str + '\n'
              }
              else {
                text += '\n'
              }
            }
            else {
              if (textUtils.isText(textItem.str)) {
                text += textItem.str + ' '
              }
            }
          })
          text += '\n'
        }

        text = text.split('\n').map(line => line.trim()).join('\n')

        const filteredText = getFilteredText(text)

        const json = await getJsonFromTxt(filteredText)

        localStorage.setItem('investmentsData', JSON.stringify(json))
        await readData()

        // Fetch fresh NAV data
        await fetchNavHistory()

        setError("")
        URL.revokeObjectURL(blobUrl)

        // Reset form
        setSelectedFile(null)
        setPassword("")
        setIsPasswordProtected(false)

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
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'PasswordException') {
          setError("Invalid password. Please try again.")
        }
        else if (err instanceof Error && err.message) {
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
    console.log('Data cleareds')
    await readData()
    console.log('Data cleared')
    toast({
      title: "Data cleared",
      description: "All imported data has been removed.",
    })
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col gap-4 items-center w-fit">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Choose between light and dark mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="dark-mode">Light</Label>
                <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={checked => setTheme(checked ? "dark" : "light")} />
                <Label htmlFor="dark-mode">Dark</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 max-w-sm">
              CAS Import
            </CardTitle>

            <CardDescription className="max-w-sm">
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
                    {" "}website
                  </li>
                  <li>Select "Detailed" statement type</li>
                  <li>Set "From Date" to before you started investing</li>
                  <li>Set "To Date" as today</li>
                  <li>Choose "With Zero Balance Folios" in Folio Listing Type</li>
                  <li>Enter your email and create a password</li>
                  <li>Submit the form</li>
                </ol>
              </div>
            </CardDescription>

          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                {meta && (
                  <div className="rounded-lg border p-4 max-w-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-2">
                        <TypographySmall text="Current Data" />
                        <div className="text-sm text-muted-foreground">
                          <div>From: {new Date(meta.from).toLocaleDateString()}</div>
                          <div>To: {new Date(meta.to).toLocaleDateString()}</div>
                          <div>Exported: {new Date(meta.exportedAt).toLocaleString()}</div>
                          <div>Transactions: {transactions.length}</div>
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
                      ) : transactions.length ? (
                        'Update Data'
                      ) : (
                        'Import'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
