'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({
  href,
  children,
  exact = false,
}: { href: string; children: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={[
        "px-3 py-2 text-sm rounded-md transition-colors",
        active ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
      ].join(' ')}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
