"use client"

import {
  OrganizationSwitcher,
  UserButton,
  InviteMembersButton,
  useOrganization,
} from "@clerk/nextjs"
import Image from "next/image"
import { Courgette } from "next/font/google"
import Hint from "@/components/ui/hint"
import { LucidePlus } from "lucide-react"
import Link from "next/link"

const courgette = Courgette({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
})

const NavHeader = () => {
  const { organization } = useOrganization()

  return (
    <nav className="flex items-center justify-between p-4">
      <Link href={"/"}>
        <div className="flex items-center gap-4">
          <Hint label="Back to Home">
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

      <div className="flex items-center gap-6">
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
          <UserButton
            afterSwitchSessionUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: "32px",
                  height: "32px",
                },
              },
            }}
          />
        </Hint>
      </div>
    </nav>
  )
}
export default NavHeader
