
import React, { useState, useMemo } from 'react';
import { User, SubscriptionStatus, UserRole } from '../../types';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { MOCK_COMPANY_DATA } from '../../constants';

interface UserManagementProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const EditUserModal: React.FC<{ user: User, onSave: (updatedUser: User) => void, onClose: () => void }> = ({ user, onSave, onClose }) => {
    const [name, setName] = useState(user.name);
    const [subscription, setSubscription] = useState<SubscriptionStatus>(user.subscriptionStatus);
    const [role, setRole] = useState<UserRole>(user.role);
    const [companyId, setCompanyId] = useState<string>(user.companyId?.toString() || 'none');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            ...user, 
            name, 
            subscriptionStatus: subscription,
            role,
            companyId: companyId === 'none' ? undefined : parseInt(companyId, 10)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Benutzer bearbeiten</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="subscription" className="block text-sm font-medium text-slate-700">Abo-Status</label>
                                    <select id="subscription" value={subscription} onChange={e => setSubscription(e.target.value as SubscriptionStatus)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="free">Free</option>
                                        <option value="pro">Pro</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">Rolle</label>
                                    <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="user">User</option>
                                        <option value="azubi">Azubi</option>
                                        <option value="meister">Meister</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                               <label htmlFor="company" className="block text-sm font-medium text-slate-700">Unternehmen</label>
                               <select id="company" value={companyId} onChange={e => setCompanyId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="none">Keine Zuordnung</option>
                                    {MOCK_COMPANY_DATA.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Abbrechen</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700">Speichern</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ITEMS_PER_PAGE = 10;

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => 
        users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        ), 
    [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const handleEdit = (user: User) => {
        setEditingUser(user);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };
    
    const handleSaveUser = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    return (
        <div className="fade-in">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Benutzerverwaltung</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Suchen nach Name oder E-Mail..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-80 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-200 bg-slate-50 text-sm text-slate-600">
                                <th className="p-3">Name</th>
                                <th className="p-3">Level</th>
                                <th className="p-3">XP</th>
                                <th className="p-3">Rolle</th>
                                <th className="p-3">Unternehmen</th>
                                <th className="p-3">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map(user => (
                                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 font-medium text-slate-800">
                                        <div className="flex flex-col">
                                            <span>{user.name}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-slate-600">{user.level}</td>
                                    <td className="p-3 text-slate-600">{user.xp.toLocaleString('de-DE')}</td>
                                    <td className="p-3">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'meister' ? 'bg-red-100 text-red-800' : user.role === 'azubi' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600">{MOCK_COMPANY_DATA.find(c => c.id === user.companyId)?.name || '-'}</td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md"><Pencil className="h-4 w-4"/></button>
                                            <button onClick={() => handleDelete(user.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md"><Trash2 className="h-4 w-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-slate-500">
                        Zeige {paginatedUsers.length} von {filteredUsers.length} Benutzern
                    </p>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 disabled:opacity-50 disabled:cursor-not-allowed border rounded-md hover:bg-slate-100"><ChevronLeft className="h-5 w-5"/></button>
                        <span className="text-sm font-medium">Seite {currentPage} von {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 disabled:opacity-50 disabled:cursor-not-allowed border rounded-md hover:bg-slate-100"><ChevronRight className="h-5 w-5"/></button>
                    </div>
                </div>
            </div>
             {editingUser && <EditUserModal user={editingUser} onSave={handleSaveUser} onClose={() => setEditingUser(null)} />}
        </div>
    );
};

export default UserManagement;
