import { useContext } from 'react';
import { AuthContext, DataContext, UIContext } from '../contexts/AppContext';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AppProvider');
    }
    return context;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within an AppProvider');
    }
    return context;
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error('useUI must be used within an AppProvider');
    }
    return context;
};
