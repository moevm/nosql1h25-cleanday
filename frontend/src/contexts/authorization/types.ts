export interface AuthContextType {
    isAuthenticated: boolean;
    token: (accessToken: string) => void;
    username: string;
    setUsername: (username: string) => void;
    logout: () => void;
    isLoading: boolean;
}
