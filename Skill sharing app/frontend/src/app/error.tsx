'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 min-h-screen">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold font-headline mb-2">Something went wrong!</h1>
          <p className="text-muted-foreground mb-2">
            We're sorry, but an unexpected error occurred.
          </p>
          {error.message && (
            <p className="text-sm text-muted-foreground bg-destructive/10 rounded px-4 py-2 mt-4 inline-block max-w-md">
              Error: {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => reset()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
