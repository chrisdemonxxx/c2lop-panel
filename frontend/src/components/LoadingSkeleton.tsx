export default function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-800 rounded ${className}`} role="status" aria-label="Loading">
      &nbsp;
    </div>
  );
}
