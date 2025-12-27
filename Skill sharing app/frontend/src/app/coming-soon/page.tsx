import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';

export default function ComingSoon() {
  const comingSoonImage = PlaceHolderImages.find(p => p.id === 'coming-soon');

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      {comingSoonImage && (
        <Image
          src={comingSoonImage.imageUrl}
          alt="Coming soon illustration"
          width={400}
          height={300}
          className="max-w-xs md:max-w-sm mb-8 rounded-lg"
          data-ai-hint={comingSoonImage.imageHint}
        />
      )}
      <h1 className="text-4xl font-bold font-headline mb-4"><span>Coming Soon!</span></h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        <span>We're working hard on this feature. Check back later to see what's new!</span>
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
