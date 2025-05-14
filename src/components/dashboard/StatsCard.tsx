import React from 'react';
import { cn } from '../../utils/cn';
import SkeletonLoader from '../ui/Skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: string | number;
    positive?: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  className,
  isLoading = false,
}) => {
  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          
          {isLoading ? (
            <SkeletonLoader height={36} width={100} className="mt-1" />
          ) : (
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          )}
          
          {change && !isLoading && (
            <p className={cn(
              'text-xs mt-2 flex items-center',
              change.positive ? 'text-success' : 'text-destructive'
            )}>
              <span className={cn(
                'inline-block mr-1',
                change.positive ? 'rotate-0' : 'rotate-180'
              )}>
                ↑
              </span>
              {change.value} from last month
            </p>
          )}
        </div>
        
        <div className="p-3 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;