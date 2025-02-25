export function TypographySmall({ text, className }: { text: string, className?: string }) {
  return (
    <small className={`text-sm font-medium leading-none ${className || ''}`}>{text}</small>
  )
}
