import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TypographySmall } from "@/components/ui/typography-small"
import { useTheme } from "@/components/theme-provider"

export default function SwitchDemo() {
  const { theme, setTheme } = useTheme()

  const changeTheme = (checked: boolean) => {
    if (checked) {
      setTheme("dark")
    }
    else{
      setTheme("light")
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
      </div>
    </div>
  )
}
