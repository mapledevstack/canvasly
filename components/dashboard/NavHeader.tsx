"use client"

import {
  OrganizationSwitcher,
  UserButton,
  InviteMembersButton,
  useOrganization,
} from "@clerk/nextjs"
import Image from "next/image"
import { Courgette } from "next/font/google"
import Hint from "../ui/hint"
import { LucidePlus } from "lucide-react"

const courgette = Courgette({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

const NavHeader = () => {
  const { organization } = useOrganization()

  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <Image
          src="/logo.svg"
          alt="Canvasly Logo"
          height={41}
          width={67}
          className="size-10 select-none"
        />
        <h1 className={`text-3xl font-bold ${courgette.className} select-none`}>
          Canvasly~
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Hint label="Switch organization">
          <OrganizationSwitcher />
        </Hint>
        <Hint label="Invite users">
          {organization && (
            <>
              <InviteMembersButton
                children={
                  <LucidePlus className="rounded-sm bg-primary text-primary-foreground" />
                }
              />
            </>
          )}
        </Hint>
        <Hint label="User settings">
          <UserButton />
        </Hint>
      </div>
    </nav>
  )
}
export default NavHeader
