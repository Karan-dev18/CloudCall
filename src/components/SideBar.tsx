'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constant';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className="sticky left-0 top-0 flex h-screen w-fit flex-col justify-between bg-dark-1/80 backdrop-blur-md border-r border-white/10 p-6 pt-28 text-white max-sm:hidden lg:w-[264px] transition-all duration-300 ease-in-out z-40">
      <div className="flex flex-1 flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex gap-4 items-center p-4 rounded-2xl justify-start transition-all duration-300 ease-in-out hover:bg-white/5 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,191,0,0.3)]',
                {
                  'bg-primary shadow-[0_0_15px_rgba(255,191,0,0.6)] text-dark-1 hover:bg-primary/90': isActive,
                }
              )}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={24}
                height={24}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
