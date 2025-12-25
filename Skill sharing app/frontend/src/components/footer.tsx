import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Code, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className={cn("bg-card border-t border-border mt-auto w-full footerRoot")}>
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl")}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={cn("flex items-center brand")}>
            <Code className="h-6 w-6 text-primary" />
            <span className="ml-2 text-lg font-headline font-bold">Community SkillSwap</span>
          </div>
          <div className={cn("text-center text-sm text-muted-foreground copy")}>
            <span>&copy; {new Date().getFullYear()} Community SkillSwap. All rights reserved.</span>
          </div>
          <div className={cn("flex items-center space-x-6 social")}>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github size={20} />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
