import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-muted-foreground">
      Redirecting to Efiko AI Chat...
    </div>
  );
}