import Image from "next/image"
import Link from "next/link"

import Hint from "@/components/ui/hint"

import { Courgette } from "next/font/google"
import CanvasName from "./_components/CanvasName"

type Props = {
  children: React.ReactNode
  params: Promise<{ canvasId: string }>
}

const courgette = Courgette({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

const Layout = async ({ children, params }: Props) => {
  const { canvasId } = await params

  return (
    <div className="relative h-screen">
      {/* Canvasly logo */}
      <div className="absolute top-3 left-16 z-10 hidden min-[1080px]:block">
        <Link href="/dashboard">
          <div className="flex items-center gap-4">
            <Hint label="Back to Dashboard">
              <Image
                src="/logo.svg"
                alt="Canvasly Logo"
                height={41}
                width={67}
                className="size-10 select-none"
              />
            </Hint>

            <h1
              className={`text-3xl font-bold ${courgette.className} select-none`}
            >
              Canvasly~
            </h1>
          </div>
        </Link>
      </div>

      {/* Canvas name */}
      <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <CanvasName canvasId={canvasId} />
      </div>

      <div className="h-full">{children}</div>
    </div>
  )
}

export default Layout
