import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ChartTypeSelect({ value, onValueChange, options }: { value: string, onValueChange: (value: string) => void, options: { label: string, value: string }[] }) {

  return (
    <Select value={value} onValueChange={(value) => onValueChange(value)}>
      <SelectTrigger
        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
        aria-label="Select a value"
      >
        <SelectValue placeholder="Select a value" />
      </SelectTrigger>
      <SelectContent align="end" className="rounded-xl">
        {options.map(({ label, value }) =>
          <SelectItem
            key={value}
            value={value}
            className="rounded-lg [&_span]:flex"
          >
            <div className="flex items-center gap-2 text-xs">
              {label}
            </div>
          </SelectItem>
          )}
      </SelectContent>
    </Select>
  )
}
