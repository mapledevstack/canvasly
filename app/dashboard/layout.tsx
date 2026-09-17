import NavHeader from "./_components/NavHeader"

type Props = {
  children: React.ReactNode
}
const layout = ({ children }: Props) => {
  return (
    <div>
      <header>
        <nav>
          <NavHeader />
        </nav>
      </header>

      <main>{children}</main>
    </div>
  )
}
export default layout
