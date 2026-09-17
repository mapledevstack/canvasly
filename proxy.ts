import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl

    if (pathname !== "/") {
      await auth.protect()
    }
  },
  {
    frontendApiProxy: {
      enabled: true,
    },
  }
)

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
}
