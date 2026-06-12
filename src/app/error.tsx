"use client";

export const dynamic = "force-dynamic";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-error-500 mb-4">500</h1>
        <p className="text-xl text-neutral-600 mb-2">Something went wrong</p>
        <p className="text-sm text-neutral-500 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
