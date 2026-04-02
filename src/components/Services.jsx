import React, { useState } from 'react';
import {
    FileText, Home, Users, Zap, PenTool, CheckCircle,
    Gavel, BookOpen, FileSignature, GitMerge, X,
    ShieldCheck, Lock, ArrowRight
} from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';

const services = [
    {
        icon: FileText,
        title: 'E-Khata',
        desc: 'Official property identification (Form 9 & 11A) issued by authorities. Fast and verified documentation for your property.',
        category: 'Core'
    },
    {
        icon: CheckCircle,
        title: 'MODT Closure / Loan Closure',
        desc: 'Official closure of mortgage and bank loan records at sub-registrar office after loan tenure. Hassle-free title clearance.',
        category: 'Core'
    },
    {
        icon: Users,
        title: 'Khata Transfer',
        desc: 'Seamless transfer of property ownership records in municipal books. We handle the entire documentation and follow-up.',
        category: 'Core'
    },
    {
        icon: Zap,
        title: 'BESCOM Services',
        desc: 'Name change, load enhancement, and new meter installations. Hassle-free electrical utility management for your property.',
        category: 'Utility'
    },
    {
        icon: PenTool,
        title: 'Rental and Lease Agreement',
        desc: 'Legally binding drafting and registration of residential and commercial lease deeds to protect your interests.',
        category: 'Legal'
    },
    {
        icon: Home,
        title: 'Property Tax',
        desc: 'Assistance in SAS (Self Assessment Scheme) tax calculation and payment. Clear your property dues with official receipts.',
        category: 'Utility'
    },
    {
        icon: Gavel,
        title: 'Registry of Property',
        desc: 'Full assistance in property registration, gift deeds, and sale deeds at the sub-registrar office.',
        category: 'Legal'
    },
    {
        icon: FileSignature,
        title: 'MOU Services',
        desc: 'Drafting of Memorandum of Understanding and Agreements to Sell with strict legal compliance.',
        category: 'Legal'
    },
    {
        icon: GitMerge,
        title: 'Family Tree',
        desc: 'Verification and procurement of Geneological Tree certificates for inheritance and legacy property matters.',
        category: 'Legal'
    },
    {
        icon: Gavel,
        title: 'Legal Consultation',
        desc: 'Professional legal advice on property disputes, verification of documents, and compliance check for new purchases.',
        category: 'Legal'
    }
];

const Services = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleServiceClick = (title) => {
        setSelectedService(title);
        setIsModalOpen(true);
    };

    return (
        <div id="services" className="py-24 bg-[#f8fafc] relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <ServiceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serviceName={selectedService}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-950 text-green-400 text-xs font-black mb-6 uppercase tracking-[0.2em] shadow-xl border border-white/10 vault-gradient">
                        <Lock size={14} className="animate-pulse" />
                        <span>The E-Khata Digital Vault</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-[1.1] tracking-tight">
                        Complete Property Legality <br />
                        <span className="text-primary italic">In One Secure Place</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                        The gold standard in Bengaluru property documentation. Verified experts, on-ground execution, and 100% transparency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className="group relative p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden vault-card-hover flex flex-col h-full"
                            >
                                {/* Vault Accents */}
                                <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:rotate-12 group-hover:scale-150">
                                    <ShieldCheck size={180} className="text-primary" />
                                </div>

                                <div className="relative z-10">
                                    <div className="w-16 h-16 bg-green-50 text-primary rounded-2xl flex items-center justify-center mb-8 border border-green-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                        <Icon size={32} />
                                    </div>

                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-[2px] w-4 bg-primary/30"></div>
                                            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-primary/60">
                                                {service.category}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-primary transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                                            {service.desc}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleServiceClick(service.title)}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-green-50 text-primary font-black rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 w-full justify-center group/btn mt-auto shadow-sm"
                                    >
                                        <span>Apply Now</span>
                                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Services;
