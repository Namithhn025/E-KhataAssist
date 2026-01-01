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
                        We simplify property paperwork for you. Legal, fast, and completely hassle-free. Exclusively offered in Bengaluru.
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
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
                        <div id="e-khata-card" className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 bg-[#FBBF24] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                                POPULAR
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-primary">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">E-Khata Services</h3>
                            <p className="text-gray-600 mb-6">Get your E-Khata / A-Khata without running around government offices.</p>
                            <button onClick={() => handleServiceClick('E-Khata Service')} className="inline-flex items-center font-semibold text-primary hover:gap-2 transition-all">
                                Apply Now <ArrowRight size={16} className="ml-1" />
                            </button>
                        </div>

                        <div id="ec-card" className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 bg-[#FBBF24] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                                POPULAR
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-700">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Encumbrance Certificate</h3>
                            <p className="text-gray-600 mb-6">Get EC for your property easily without hassle.</p>
                            <button onClick={() => handleServiceClick('Encumbrance Certificate')} className="inline-flex items-center font-semibold text-green-700 hover:gap-2 transition-all">
                                Apply Now <ArrowRight size={16} className="ml-1" />
                            </button>
                        </div>

                        <div id="transfer-card" className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 relative group hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 bg-[#FBBF24] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                                POPULAR
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-700">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Khata Transfer</h3>
                            <p className="text-gray-600 mb-6">Seamless ownership transfer process made simple.</p>
                            <button onClick={() => handleServiceClick('Khata Transfer')} className="inline-flex items-center font-semibold text-primary hover:gap-2 transition-all">
                                Apply Now <ArrowRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
