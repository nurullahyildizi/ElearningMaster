import React, { useState } from 'react';
import { SOCIAL_TABS } from '../../constants';
import StatusFeed from './StatusFeed';
import FriendsManager from './FriendsManager';
import ChatInterface from './ChatInterface';
import LearningRoomBrowser from './LearningRoomBrowser';

type SocialTab = 'feed' | 'friends' | 'messages' | 'rooms';

const SocialView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SocialTab>('feed');

    const renderContent = () => {
        switch (activeTab) {
            case 'feed':
                return <StatusFeed />;
            case 'friends':
                return <FriendsManager />;
            case 'messages':
                return <ChatInterface />;
            case 'rooms':
                return <LearningRoomBrowser />;
            default:
                return null;
        }
    };

    return (
        <section id="social-view" className="fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">Social Hub</h2>

            <div className="mb-6 border-b border-slate-700">
                <div className="community-tabs flex space-x-2 sm:space-x-4" role="tablist" aria-label="Social-Tabs">
                    {SOCIAL_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as SocialTab)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm sm:text-base sm:px-4 sm:py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'active bg-slate-800/60'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                            }`}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                        >
                           <tab.icon className="h-5 w-5" />
                           {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="fade-in">
                 {renderContent()}
            </div>
        </section>
    );
};

export default SocialView;
