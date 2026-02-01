'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Wallet } from 'lucide-react';
import { ConnectButton } from '@mysten/dapp-kit';

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Campaigns' },
    { href: '/activity', label: 'Activity' },
  ];

  return (
    <header className="bg-white w-full border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between h-20 px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-[#E0F3E0] p-2 rounded-lg">
            <Shield className="h-6 w-6 text-[#14B8A6]" />
          </div>
          <span className="font-bold text-xl">
            <span className="text-gray-800">Sui</span>
            <span className="text-[#14B8A6]">Care</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-gray-500 font-medium transition-colors hover:text-gray-900 pb-1 ${ 
                (pathname === '/' && link.href === '/') || (pathname.startsWith(link.href) && link.href !== '/')
                  ? 'border-b-2 border-[#14B8A6] text-gray-900' 
                  : ''
              }`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div>
          <ConnectButton
            connectText={
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </div>
            }
            className="!bg-[#B2FFD6] !text-gray-800 !font-semibold !rounded-full !px-5 !py-2.5 hover:!bg-[#A1E6C1]"
          />
        </div>
      </div>
    </header>
  );
}
