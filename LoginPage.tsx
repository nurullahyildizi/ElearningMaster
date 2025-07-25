import React, { useState } from 'react';
import { Bolt, Loader2 } from 'lucide-react';

interface LoginPageProps {
    onLogin: (email: string, password_unused: string) => Promise<{success: boolean, error?: string}>;
    onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
    const [email, setEmail] = useState('klaus.meister@email.de');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await onLogin(email, password);
        if (!result.success) {
            setError(result.error || 'Ein unbekannter Fehler ist aufgetreten.');
        }
        // On success, the onAuthStateChanged listener in App.tsx will handle navigation.
        setIsLoading(false);
    };
    
    return (
        <div className="auth-container fade-in">
            <div className="glass-card p-8 rounded-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-2">
                         <Bolt className="text-blue-400 h-10 w-10 mr-2" />
                         <h1 className="text-3xl font-bold text-white">MeisterWerk</h1>
                    </div>
                    <h2 className="text-xl text-slate-300">Willkommen zurück!</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">E-Mail</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            autoComplete="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="mt-1 block w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-300">Passwort</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            autoComplete="current-password" 
                            required 
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             disabled={isLoading}
                            className="mt-1 block w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition disabled:bg-slate-500 disabled:cursor-not-allowed">
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Anmelden'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-slate-400">
                    Noch keinen Account?{' '}
                    <button onClick={onNavigateToRegister} className="font-semibold text-blue-400 hover:text-blue-300">
                        Jetzt registrieren
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;