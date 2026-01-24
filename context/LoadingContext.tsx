import React, { createContext, useContext, useState } from 'react';
import { GlobalLoadingBar } from '../components/ui/GlobalLoadingBar';

interface LoadingContextType {
    setIsNavigating: (value: boolean) => void;
    isNavigating: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNavigating, setIsNavigating] = useState(false);

    return (
        <LoadingContext.Provider value={{ isNavigating, setIsNavigating }}>
            <GlobalLoadingBar isLoading={isNavigating} />
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) throw new Error('useLoading must be used within LoadingProvider');
    return context;
};
