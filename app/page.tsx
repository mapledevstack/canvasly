import Link from "next/link"

const Home = () => {
  return (
    <div className="grid h-full w-full place-items-center">
      <button className="rounded-2xl border-4 p-4">
        <Link href="/dashboard">Dashboard</Link>
      </button>
    </div>
  )
}
export default Home
