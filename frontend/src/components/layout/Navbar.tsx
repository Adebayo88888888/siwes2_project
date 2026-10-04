import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>Efiko AI</span>
          </Link>

          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/chat" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4" />
              Chat
            </Link>
            <Link href="/documents" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Documents
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/chat'}
            className="hidden sm:inline-flex"
          >
            Start Chatting
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}