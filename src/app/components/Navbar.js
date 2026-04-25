"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="main-navbar">
      <div className="nav-container">
        <Link href="/" className="nav-brand">
          Fashiq <span className="brand-italic">AI</span>
        </Link>
        
        <div className="nav-actions">
          <Link href="/studio/clothing" className="nav-try-btn">
            Try Now
          </Link>
        </div>
      </div>
    </nav>
  );
}
