"use client";

import { Logo } from "@/components/logo";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Logo />

      <div className="flex items-center gap-4">
        {/* <ThemeToggle /> */}
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
