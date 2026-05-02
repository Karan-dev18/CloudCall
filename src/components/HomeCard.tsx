'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, img, title, description, handleClick }: HomeCardProps) => {
  return (
    <section
      className={cn(
        'px-4 py-6 flex flex-col justify-between w-full min-h-[260px] rounded-3xl cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,191,0,0.4)] hover:border-primary/50 glass',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex-center bg-white/20 backdrop-blur-md border border-white/10 size-12 rounded-2xl shadow-inner text-primary">
        <Image src={img} alt="meeting" width={27} height={27} className="filter drop-shadow-md" />
      </div>
      
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-lg font-normal text-white/70">{description}</p>
      </div>
    </section>
  );
};

export default HomeCard;
