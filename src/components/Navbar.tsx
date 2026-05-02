import Image from 'next/image';
// import {dark} from "@clerk/themes";
import Link from 'next/link';
import { ClerkProvider, SignedIn, UserButton } from '@clerk/nextjs';
import { Hexagon } from 'lucide-react';

import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="flex-between fixed z-50 w-full glass px-6 py-4 lg:px-10 transition-all duration-300 ease-in-out">
      <Link href="/" className="flex items-center gap-1">
        <Hexagon className="size-8 text-primary fill-primary" />
        <p className="text-2xl font-extrabold tracking-tight text-[#38BDF8] max-sm:hidden">
          CloudCall
        </p>
      </Link>
      <div className="flex-between gap-5 bg-red">
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
