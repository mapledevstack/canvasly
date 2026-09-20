import { Show, SignInButton } from "@clerk/nextjs"
import Link from "next/link"

const CTA = () => {
  return (
    <div className="pointer-events-none relative z-50 grid h-full w-full place-items-center">
      <div className="pointer-events-auto rounded-2xl border border-border/60 bg-background/80 p-2 shadow-xl shadow-black/10 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
        <Show when="signed-out">
          <SignInButton forceRedirectUrl="/dashboard">
            <button className="rounded-xl bg-foreground px-8 py-4 text-sm font-semibold tracking-wide text-background transition-colors hover:bg-foreground/90">
              START DRAWING
            </button>
          </SignInButton>
        </Show>

        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="block rounded-xl bg-foreground px-8 py-4 text-sm font-semibold tracking-wide text-background transition-colors hover:bg-foreground/90"
          >
            START DRAWING
          </Link>
        </Show>
      </div>
    </div>
  )
}

export default CTA
