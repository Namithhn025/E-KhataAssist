import React, { useState } from 'react';
import { Search, ArrowRight, FileText, Home, ShieldCheck, Users } from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';

const Hero = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleServiceClick = (title) => {
        setSelectedService(title);
        setIsModalOpen(true);
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Trigger highlight animation
            element.classList.remove('highlight-service');
            void element.offsetWidth; // Force reflow to restart animation
            element.classList.add('highlight-service');
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-green-50 via-white to-green-50 pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
            <ServiceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serviceName={selectedService}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                        The Easiest Way to Get <br />
                        <span className="text-primary">Property Documentation</span> Done
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Avoid delays, agents, and office visits — choose E Khata Assist.
                    </p>



                    {/* Quick Actions */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {[
                            { name: 'E-Khata Service', id: 'e-khata-card' },
                            { name: 'Encumbrance Certificate', id: 'ec-card' },
                            { name: 'Khata Transfer', id: 'transfer-card' }
                        ].map((item) => (
                            <button
                                key={item.name}
                                onClick={() => scrollToSection(item.id)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                        <div id="e-khata-card" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300">
                            <div className="absolute top-0 right-0 bg-[#FBBF24] text-black text-[10px] font-black px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-widest uppercase">
                                POPULAR
                            </div>
                            <div className="w-14 h-14 bg-green-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <FileText size={28} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Core Service</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">E-Khata Issuance</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">Official property identification (Form 9 & 11A) issued by authorities. Fast and verified.</p>
                            <button onClick={() => handleServiceClick('E-Khata Issuance')} className="inline-flex items-center gap-2 font-bold text-primary px-6 py-3 bg-green-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-all w-full justify-center">
                                Apply Now <ArrowRight size={18} />
                            </button>
                        </div>

                        <div id="ec-card" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300">
                            <div className="absolute top-0 right-0 bg-[#FBBF24] text-black text-[10px] font-black px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-widest uppercase">
                                MUST HAVE
                            </div>
                            <div className="w-14 h-14 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <ShieldCheck size={28} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Security</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Encumbrance Cert</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">Proof that your property is free from legal or monetary liabilities. Essential for safety.</p>
                            <button onClick={() => handleServiceClick('Encumbrance Cert')} className="inline-flex items-center gap-2 font-bold text-green-700 px-6 py-3 bg-green-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-all w-full justify-center">
                                Apply Now <ArrowRight size={18} />
                            </button>
                        </div>

                        <div id="transfer-card" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300">
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-widest uppercase">
                                TRUSTED
                            </div>
                            <div className="w-14 h-14 bg-green-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Users size={28} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Ownership</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Khata Transfer</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">Seamless transfer of property ownership in municipal books. Complete documentation handled.</p>
                            <button onClick={() => handleServiceClick('Khata Transfer')} className="inline-flex items-center gap-2 font-bold text-primary px-6 py-3 bg-green-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-all w-full justify-center">
                                Apply Now <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
