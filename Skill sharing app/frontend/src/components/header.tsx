'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Code,
  Search,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Repeat,
  LogIn,
  Heart,
  UserPlus,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/skills', label: 'Browse', icon: BookOpen, protected: false },
  { href: '/skills/create', label: 'Create', icon: Plus, protected: true, requiresTeacher: true },
  { href: '/exchanges', label: 'Exchanges', icon: Repeat, protected: true },{ href: '/bookmarks', label: 'Bookmarks', icon: Heart, protected: true },
];

const NavLink = ({ href, label, icon: Icon, onClick, requiresTeacher }: { href: string; label: string; icon: React.ElementType, onClick?: () => void, requiresTeacher?: boolean }) => {
  const pathname = usePathname();
  const { canCreateSkill } = usePermissions();
  const isActive = pathname === href;
  
  // Hide Create link if user is learner
  if (requiresTeacher && !canCreateSkill) {
    return null;
  }
  
  return (
    <Link href={href} onClick={onClick} className={cn(
        "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}>
        <Icon className="h-4 w-4" />
        {label}
    </Link>
  );
};

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out successfully.' });
    router.push('/login');
  };

  const visibleNavLinks = navLinks.filter(link => !link.protected || (link.protected && user));

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      <div className={cn("flex h-16 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full")}>
        <Link href="/" className={cn("mr-6 flex items-center space-x-2 brand flex-shrink-0")}>
          <Code className="h-6 w-6 text-primary" />
          <span className="hidden font-headline font-bold sm:inline-block whitespace-nowrap">
            Community SkillSwap
          </span>
        </Link>
        <div className={cn("hidden md:flex items-center gap-6")}>
          {visibleNavLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>

        <div className={cn("flex flex-1 items-center justify-end space-x-2 md:space-x-4 min-w-0")}>
          <div className={cn("hidden lg:flex w-full max-w-xs items-center space-x-2 flex-shrink")}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />}
                      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`}><User className="mr-2 h-4 w-4" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks"><Heart className="mr-2 h-4 w-4" />My Bookmarks</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login"><LogIn className="mr-1 h-4 w-4"/> <span className="hidden sm:inline">Login</span></Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register"><UserPlus className="mr-1 h-4 w-4"/> <span className="hidden sm:inline">Sign Up</span></Link>
                </Button>
              </div>
            )
          )}

          <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden flex-shrink-0">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 sm:w-64 bg-background/95 backdrop-blur-sm border-r border-border/30">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                    <Code className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="font-headline font-bold">SkillSwap</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-4 flex-1">
                  {visibleNavLinks.map((link) => (
                     <NavLink key={link.href} {...link} onClick={() => setMobileMenuOpen(false)} />
                  ))}
                  {!user && (
                    <>
                     <NavLink href="/login" label="Login" icon={LogIn} onClick={() => setMobileMenuOpen(false)} />
                     <NavLink href="/register" label="Sign Up" icon={UserPlus} onClick={() => setMobileMenuOpen(false)} />
                    </>
                  )}
                </nav>
                <div className="border-t border-border/50 pt-4">
                   <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="search"
                        placeholder="Search skills..."
                        className="pl-9 text-sm"
                      />
                    </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
