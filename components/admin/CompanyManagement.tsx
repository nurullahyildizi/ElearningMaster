
import React from 'react';
import { Company, User } from '../../types';
import { PlusCircle, Building2, User as UserIcon } from 'lucide-react';

interface CompanyManagementProps {
    companies: Company[];
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
    users: User[];
}

const CompanyManagement: React.FC<CompanyManagementProps> = ({ companies, setCompanies, users }) => {

    const handleAddCompany = () => {
        const name = prompt("Name des neuen Unternehmens:");
        if (name) {
            const newCompany: Company = {
                id: Date.now(),
                name: name
            };
            setCompanies(prev => [...prev, newCompany]);
        }
    };
    
    return (
        <div className="fade-in">
            <div className="flex justify-between items-center mb-8">
                 <h1 className="text-4xl font-bold text-slate-900">Unternehmensverwaltung</h1>
                 <button onClick={handleAddCompany} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                     <PlusCircle className="h-5 w-5"/> Unternehmen hinzufügen
                 </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => {
                    const companyUsers = users.filter(u => u.companyId === company.id);
                    const meisters = companyUsers.filter(u => u.role === 'meister');
                    const azubis = companyUsers.filter(u => u.role === 'azubi');

                    return (
                        <div key={company.id} className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                <Building2 className="h-8 w-8 mr-3 text-slate-500" />
                                <h2 className="text-2xl font-bold text-slate-800">{company.name}</h2>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-600 mb-2">Meister:</h3>
                                <ul className="list-disc list-inside text-slate-700 pl-2">
                                    {meisters.length > 0 ? meisters.map(m => <li key={m.id}>{m.name}</li>) : <li>Keine</li>}
                                </ul>
                            </div>
                             <div className="mt-4">
                                <h3 className="font-semibold text-slate-600 mb-2">Azubis:</h3>
                                <ul className="list-disc list-inside text-slate-700 pl-2">
                                     {azubis.length > 0 ? azubis.map(a => <li key={a.id}>{a.name}</li>) : <li>Keine</li>}
                                </ul>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default CompanyManagement;
