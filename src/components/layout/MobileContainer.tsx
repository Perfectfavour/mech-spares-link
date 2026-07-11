import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export default function MobileContainer({ children, className, hasBottomNav }: MobileContainerProps) {
  return (
    <div className={cn(
      "max-w-md mx-auto min-h-screen bg-background flex flex-col relative",
      hasBottomNav && "pb-20",
      className
    )}>
      {children}
    </div>
  );
}
