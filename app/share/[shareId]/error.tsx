"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

const ErrorPage = () => {
  return (
    <div className="grid h-full place-items-center text-2xl">
      <Link href={"/dashboard"}>
        <Button size="lg" variant="destructive">
          Error
        </Button>
      </Link>
    </div>
  )
}
export default ErrorPage
