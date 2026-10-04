import { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextType {
  user: User;
  token: string;
  loading: boolean;
}

const DEFAULT_GUEST_USER: User = {
  id: 'guest',
  email: 'guest@efiko.ai',
  full_name: 'Student Guest'
};
const DEFAULT_GUEST_TOKEN = 'guest_token';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(DEFAULT_GUEST_USER);
  const [token] = useState<string>(DEFAULT_GUEST_TOKEN);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}