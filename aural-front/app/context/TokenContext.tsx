import React, { createContext, useState, useContext, ReactNode } from "react";

export interface TokenData {
    access_token: string;
    refresh_token: string;
    expires: string;
}

interface TokenContextType {
    token: TokenData | null;
    setToken: React.Dispatch<React.SetStateAction<TokenData | null>>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<TokenData | null>(null);

    return (
        <TokenContext.Provider value={{ token, setToken }}>
            {children}
        </TokenContext.Provider>
    );
};

export const useToken = (): TokenContextType => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error("useToken must be used within a TokenProvider");
    }
    return context;
};