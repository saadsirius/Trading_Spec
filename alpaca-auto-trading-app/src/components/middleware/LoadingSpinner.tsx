'use client';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
};

export default function LoadingSpinner({ size = 'md', text, className = '' }: Props) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-600 border-t-blue-500 ${sizeClasses[size]}`}></div>
      {text && (
        <span className="text-sm text-gray-400">{text}</span>
      )}
    </div>
  );
}
