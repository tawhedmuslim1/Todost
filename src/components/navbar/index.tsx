"use client";

import { Logo } from "@/components/logo";
import { SignedIn, SignedOut, UserButton, SignInButton} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 border border-b-2">
      <Logo />

      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <Button variant="outline" asChild>
            <SignInButton />
          </Button>
        </SignedOut>
      </div>
    </nav>
  );
}
