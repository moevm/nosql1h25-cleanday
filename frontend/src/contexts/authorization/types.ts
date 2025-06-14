export interface AuthContextType {
    isAuthenticated: boolean;
    token: string;
    username: string;
    setUsername: (username: string) => void;
    login: (token: string, username: string) => void;
    logout: () => void;
}
