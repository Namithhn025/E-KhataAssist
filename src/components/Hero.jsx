import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, FileText, Home, ShieldCheck, Users } from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';

const Hero = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [titleIndex, setTitleIndex] = useState(0);
    const [fade, setFade] = useState(true);

    const titles = [
        "The Easiest Way to Get Property Documentation Done",
        "Bengaluru's Most Trusted Property Documentation Service",
        "Get Your E-Khata Done — Fast, Legal & Hassle-Free",
        "No Agents. No Delays. Just Your Property Documents — Done Right.",
        "From E-Khata to Khata Transfer — We Handle It All",
        "Property Documentation Simplified for Bengaluru Homeowners"
    ];

    useEffect(() => {
        const titleInterval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setTitleIndex((prev) => (prev + 1) % titles.length);
                setFade(true);
            }, 500); // Wait for fade out
        }, 4000); // Change every 4 seconds

        return () => clearInterval(titleInterval);
    }, []);

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
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-green-200/20 rounded-full blur-[100px] -z-10 animate-float"></div>

                <div className="text-center max-w-4xl mx-auto">
                    <div className="min-h-[220px] flex items-center justify-center mb-6">
                        <h1 className={`text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight transition-all duration-1000 max-w-5xl mx-auto px-4 ${fade ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 -translate-y-8 scale-95 blur-sm'}`}>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-green-600 to-primary/80 drop-shadow-sm">
                                {titles[titleIndex]}
                            </span>
                        </h1>
                    </div>
                    <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Avoid delays, agents, and office visits — choose E Khata Assist.
                    </p>



                    {/* Quick Actions */}
                    <div className="flex flex-wrap justify-center gap-4 mb-16">
                        {[
                            { name: 'E-Khata Service', id: 'e-khata-card' },
                            { name: 'MODT Closure / Loan Closure', id: 'modt-card' },
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
                        <div id="e-khata-card" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-widest uppercase">
                                POPULAR
                            </div>
                            <div className="w-14 h-14 bg-green-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <FileText size={28} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Core Service</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">E-Khata</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">Official property identification (Form 9 & 11A) issued by authorities. Fast and verified.</p>
                            <button onClick={() => handleServiceClick('E-Khata')} className="inline-flex items-center gap-2 font-bold text-primary px-6 py-3 bg-green-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-all w-full justify-center mt-auto shadow-sm">
                                Apply Now <ArrowRight size={18} />
                            </button>
                        </div>

                        <div id="modt-card" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-widest uppercase">
                                MUST HAVE
                            </div>
                            <div className="w-14 h-14 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <ShieldCheck size={28} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Security</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">MODT Closure / Loan Closure</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">Official closure of mortgage and bank loan records at sub-registrar office after loan tenure. Hassle-free title clearance.</p>
                            <button onClick={() => handleServiceClick('MODT Closure / Loan Closure')} className="inline-flex items-center gap-2 font-bold text-green-700 px-6 py-3 bg-green-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-all w-full justify-center mt-auto shadow-sm">
                                Apply Now <ArrowRight size={18} />
                            </button>
                        </div>

                        <div id="transfer-card" className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl rounded-tr-2xl tracking-widest uppercase">
                                TRUSTED
                            </div>
                            <div className="w-14 h-14 bg-green-50 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Users size={28} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Ownership</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">Khata Transfer</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">Seamless transfer of property ownership in municipal books. Complete documentation handled.</p>
                            <button onClick={() => handleServiceClick('Khata Transfer')} className="inline-flex items-center gap-2 font-bold text-primary px-6 py-3 bg-green-50 rounded-lg group-hover:bg-primary group-hover:text-white transition-all w-full justify-center mt-auto shadow-sm">
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
