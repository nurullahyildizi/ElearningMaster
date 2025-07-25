import React from 'react';
import { Bolt, GitMerge, Cpu, Mic, MessageSquare } from 'lucide-react';

interface LandingPageProps {
    onNavigateToRegister: () => void;
    onNavigateToLogin: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="glass-card text-center p-6 rounded-xl transform hover:scale-105 transition-transform duration-300">
        <div className="inline-block p-4 bg-blue-500/20 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToRegister, onNavigateToLogin }) => {
    return (
        <div className="landing-page-container fade-in">
            <header className="landing-header">
                <div className="flex items-center">
                    <Bolt className="text-blue-400 h-8 w-8 mr-2" />
                    <h1 className="text-2xl font-bold text-white">MeisterWerk</h1>
                </div>
                <nav>
                    <button onClick={onNavigateToLogin} className="text-slate-300 hover:text-white font-semibold transition">Anmelden</button>
                    <button onClick={onNavigateToRegister} className="ml-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition">Jetzt starten</button>
                </nav>
            </header>
            
            <main className="landing-main">
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
                        Die Zukunft des <br />
                        <span className="text-blue-400">Elektrohandwerks</span>.
                    </h2>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
                        Lernen, simulieren und meistern Sie Ihre Karriere mit unserer KI-gestützten Plattform, die speziell für deutsche Elektrofachkräfte entwickelt wurde.
                    </p>
                    <div className="mt-8">
                        <button onClick={onNavigateToRegister} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg text-lg transition transform hover:scale-105">
                            Kostenlos registrieren
                        </button>
                    </div>
                </div>

                <div className="features-section">
                    <h3 className="text-3xl font-bold text-center text-white mb-8">Alles was Sie brauchen, um ein Meister zu werden</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard icon={<GitMerge className="h-8 w-8 text-blue-400" />} title="Interaktiver Lernbaum" description="Folgen Sie strukturierten Lernpfaden von den Grundlagen bis zur Meisterprüfung." />
                        <FeatureCard icon={<Cpu className="h-8 w-8 text-purple-400" />} title="Praxisnahe Simulationen" description="Testen Sie Ihr Wissen im digitalen Zwilling, bei der Fehlersuche oder in der Projektplanung." />
                        <FeatureCard icon={<Bolt className="h-8 w-8 text-yellow-400" />} title="KI-Mentor" description="Erhalten Sie personalisierte Tipps, Feedback und Unterstützung von unserem Meister-Bot." />
                        <FeatureCard icon={<MessageSquare className="h-8 w-8 text-green-400" />} title="Community & Karriere" description="Vernetzen Sie sich mit Kollegen und finden Sie passende Jobangebote, die Ihre Fähigkeiten widerspiegeln." />
                    </div>
                </div>
            </main>

            <footer className="landing-footer">
                <p>&copy; {new Date().getFullYear()} MeisterWerk Digital. Alle Rechte vorbehalten.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
