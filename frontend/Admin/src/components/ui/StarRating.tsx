import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value?: number;
  max?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value = 0, max = 5, size = 14, className = '', showValue = true }) => {
  const full = Math.round(value);
  return (
    <div className={`inline-flex items-center gap-1 ${className}`} aria-label={`Rating ${value} of ${max}`}>
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={`transition-colors ${i < full ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} stroke-[1.5]`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-gray-300 tabular-nums">{Number.isFinite(value) ? value.toFixed(1) : '0.0'}</span>
      )}
    </div>
  );
};

export default StarRating;
