import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const filledStars = Math.floor(rating);
  const hasPartialStar = rating % 1 !== 0;
  const emptyStars = maxRating - filledStars - (hasPartialStar ? 1 : 0);

  const handleStarClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={cn('flex gap-1', interactive && 'cursor-pointer', className)}>
      {/* Filled stars */}
      {Array.from({ length: filledStars }).map((_, index) => (
        <button
          key={`filled-${index}`}
          onClick={() => handleStarClick(index)}
          disabled={!interactive}
          className="p-0 h-auto border-0 bg-transparent hover:opacity-80 transition-opacity"
        >
          <Star
            className={cn(
              sizeClasses[size],
              'fill-yellow-400 text-yellow-400'
            )}
          />
        </button>
      ))}

      {/* Partial star */}
      {hasPartialStar && (
        <button
          key="partial"
          onClick={() => handleStarClick(filledStars)}
          disabled={!interactive}
          className="p-0 h-auto border-0 bg-transparent hover:opacity-80 transition-opacity relative"
        >
          <div className="overflow-hidden" style={{ width: '50%' }}>
            <Star
              className={cn(
                sizeClasses[size],
                'fill-yellow-400 text-yellow-400'
              )}
            />
          </div>
          <Star
            className={cn(
              sizeClasses[size],
              'absolute top-0 left-0 text-gray-300'
            )}
          />
        </button>
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <button
          key={`empty-${index}`}
          onClick={() => handleStarClick(filledStars + (hasPartialStar ? 1 : 0) + index)}
          disabled={!interactive}
          className="p-0 h-auto border-0 bg-transparent hover:opacity-80 transition-opacity"
        >
          <Star
            className={cn(
              sizeClasses[size],
              'text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default RatingStars;
