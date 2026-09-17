import { Show, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

const Home = () => {
  return (
    <div className="grid h-full w-full place-items-center">
      <Show when="signed-out">
        <SignInButton forceRedirectUrl="/dashboard" />
      </Show>
      <Show when="signed-in">
        <button>
          <Link href="/dashboard">Dashboard</Link>
        </button>
      </Show>
    </div>
  )
}
export default Home
