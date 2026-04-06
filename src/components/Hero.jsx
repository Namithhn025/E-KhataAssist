import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, FileText, Home, ShieldCheck, Users } from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';

// SVG Building Skyline Background
const CitySkyline = () => (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 opacity-[0.07]">
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Far buildings */}
            <rect x="50" y="120" width="60" height="200" rx="2" fill="#15803d"/>
            <rect x="55" y="130" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="75" y="130" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="55" y="155" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="75" y="155" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="55" y="180" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="75" y="180" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>

            {/* Tall tower */}
            <rect x="140" y="60" width="45" height="260" rx="2" fill="#15803d"/>
            <rect x="148" y="75" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="164" y="75" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="148" y="95" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="164" y="95" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="148" y="115" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="164" y="115" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="148" y="135" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="164" y="135" width="8" height="12" rx="1" fill="#f0fdf4" opacity="0.4"/>

            {/* Medium building */}
            <rect x="220" y="150" width="80" height="170" rx="2" fill="#15803d"/>
            <rect x="230" y="165" width="15" height="18" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="255" y="165" width="15" height="18" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="280" y="165" width="15" height="18" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="230" y="195" width="15" height="18" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="255" y="195" width="15" height="18" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="280" y="195" width="15" height="18" rx="1" fill="#f0fdf4" opacity="0.5"/>

            {/* House shape */}
            <polygon points="380,200 420,160 460,200" fill="#15803d"/>
            <rect x="385" y="200" width="70" height="120" rx="1" fill="#15803d"/>
            <rect x="405" y="225" width="25" height="40" rx="1" fill="#f0fdf4" opacity="0.5"/>

            {/* Document icon shape */}
            <rect x="520" y="140" width="50" height="65" rx="4" fill="#15803d" opacity="0.8"/>
            <rect x="530" y="155" width="30" height="3" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="530" y="163" width="25" height="3" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="530" y="171" width="20" height="3" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <polygon points="555,140 570,155 555,155" fill="#0f6b31" opacity="0.6"/>

            {/* Right side buildings */}
            <rect x="1050" y="100" width="50" height="220" rx="2" fill="#15803d"/>
            <rect x="1058" y="115" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1076" y="115" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1058" y="140" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1076" y="140" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1058" y="165" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1076" y="165" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>

            <rect x="1130" y="80" width="55" height="240" rx="2" fill="#15803d"/>
            <rect x="1140" y="95" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1160" y="95" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1140" y="120" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1160" y="120" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1140" y="145" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>
            <rect x="1160" y="145" width="10" height="14" rx="1" fill="#f0fdf4" opacity="0.4"/>

            {/* Wide apartment */}
            <rect x="1220" y="160" width="90" height="160" rx="2" fill="#15803d"/>
            <rect x="1235" y="175" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="1260" y="175" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="1285" y="175" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="1235" y="200" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="1260" y="200" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="1285" y="200" width="12" height="16" rx="1" fill="#f0fdf4" opacity="0.5"/>

            {/* Right side document */}
            <rect x="980" y="160" width="40" height="55" rx="3" fill="#15803d" opacity="0.7"/>
            <rect x="988" y="172" width="24" height="2.5" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="988" y="179" width="20" height="2.5" rx="1" fill="#f0fdf4" opacity="0.5"/>
            <rect x="988" y="186" width="16" height="2.5" rx="1" fill="#f0fdf4" opacity="0.5"/>

            {/* Ground line */}
            <rect x="0" y="318" width="1440" height="2" fill="#15803d" opacity="0.1"/>
        </svg>
    </div>
);

// Floating decorative elements
const FloatingElements = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating document top-left */}
        <div className="absolute top-[15%] left-[8%] animate-float-slow opacity-[0.06]">
            <div className="document-symbol text-primary"></div>
        </div>

        {/* Floating key top-right */}
        <div className="absolute top-[20%] right-[10%] animate-float opacity-[0.05]">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <circle cx="22" cy="22" r="14" stroke="#15803d" strokeWidth="2.5" fill="none"/>
                <circle cx="22" cy="22" r="5" fill="#15803d" opacity="0.3"/>
                <rect x="33" y="19" width="22" height="6" rx="3" fill="#15803d"/>
                <rect x="48" y="25" width="6" height="10" rx="2" fill="#15803d"/>
                <rect x="40" y="25" width="6" height="8" rx="2" fill="#15803d"/>
            </svg>
        </div>

        {/* Floating stamp mid-left */}
        <div className="absolute top-[55%] left-[5%] animate-float opacity-[0.08]" style={{animationDelay: '1s'}}>
            <div className="stamp-float"></div>
        </div>

        {/* Floating house mid-right */}
        <div className="absolute top-[50%] right-[6%] animate-float-slow opacity-[0.05]" style={{animationDelay: '2s'}}>
            <div className="building-symbol text-primary"></div>
        </div>
        
        {/* Additional document symbols */}
        <div className="absolute bottom-[20%] left-[12%] animate-float opacity-[0.04]" style={{animationDelay: '1.5s'}}>
            <div className="document-symbol text-primary rotate-12"></div>
        </div>
    </div>
);

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
            }, 500);
        }, 4000);

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
            element.classList.remove('highlight-service');
            void element.offsetWidth;
            element.classList.add('highlight-service');
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-green-50 via-white to-green-50/80 pt-8 pb-24 lg:pt-16 lg:pb-32 overflow-hidden section-divider-wave">
            <ServiceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serviceName={selectedService}
            />

            {/* Decorative backgrounds */}
            <FloatingElements />
            <CitySkyline />

            {/* Blueprint grid pattern overlay */}
            <div className="absolute inset-0 blueprint-grid pointer-events-none z-0 opacity-[0.4]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-green-200/20 rounded-full blur-[100px] -z-10 animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-green-300/10 rounded-full blur-[80px] -z-10 animate-float-slow"></div>

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
                                className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:border-primary hover:text-primary hover:bg-green-50 transition-all shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                        <div id="e-khata-card" className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full service-card-premium">
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

                        <div id="modt-card" className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full service-card-premium">
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

                        <div id="transfer-card" className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full service-card-premium">
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
