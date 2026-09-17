import Image from "next/image"

export const Loading = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Image
        src="/logo.svg"
        alt="Logo"
        loading="eager"
        height={41}
        width={67}
        className="size-20 animate-pulse duration-700"
      />
    </div>
  )
}

export default Loading
