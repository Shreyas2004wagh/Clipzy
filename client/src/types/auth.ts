export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (credentialResponse: any) => void;
    logout: () => void;
    isAuthenticated: boolean;
  }