import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

type Props = {
  children: React.ReactNode
  label: string
}
const hint = ({ children, label }: Props) => {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
export default hint
