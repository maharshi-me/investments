import { ReactNode } from "react";

export function TypographyH2({ text }: { text: string | ReactNode }) {
  return <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">{text}</h2>;
}
