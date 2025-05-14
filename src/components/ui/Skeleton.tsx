import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  height?: number;
  width?: number | string;
  count?: number;
  circle?: boolean;
  className?: string;
  containerClassName?: string;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  height,
  width,
  count = 1,
  circle = false,
  className = '',
  containerClassName = '',
}) => {
  const { theme } = useTheme();
  
  const baseColor = theme === 'light' ? '#e5e7eb' : '#2d3748';
  const highlightColor = theme === 'light' ? '#f3f4f6' : '#4a5568';

  return (
    <Skeleton
      height={height}
      width={width}
      count={count}
      circle={circle}
      className={className}
      containerClassName={containerClassName}
      baseColor={baseColor}
      highlightColor={highlightColor}
    />
  );
};

export default SkeletonLoader;