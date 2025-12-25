import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const notFoundImage = PlaceHolderImages.find(p => p.id === 'page-not-found');

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      {notFoundImage && (
        <Image
          src={notFoundImage.imageUrl}
          alt="Page not found illustration"
          width={400}
          height={300}
          className="max-w-xs md:max-w-sm mb-8 rounded-lg"
          data-ai-hint={notFoundImage.imageHint}
        />
      )}
      <h1 className="text-4xl font-bold font-headline mb-4"><span>404 - Page Not Found</span></h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        <span>Oops! The page you are looking for does not exist. It might have been moved or deleted.</span>
      </p>
      <Button asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Go back to Homepage</span>
        </Link>
      </Button>
    </div>
  );
}
