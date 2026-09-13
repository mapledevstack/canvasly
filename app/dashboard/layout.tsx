import NavHeader from "@/components/dashboard/NavHeader"

type Props = {
  children: React.ReactNode
}
const layout = ({ children }: Props) => {
  return (
    <>
      <NavHeader />
      {children}
    </>
  )
}
export default layout
