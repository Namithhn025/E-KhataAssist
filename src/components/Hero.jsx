import React, { useState, useEffect } from 'react';
import { ArrowRight, FileText, ShieldCheck, Users } from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';

const CitySkyline = () => (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0 opacity-[0.07]">
        <svg viewBox="0 0 1444 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect x="50" y="120" width="60" height="200" rx="2" fill="#15803d"/>
            <rect x="140" y="60" width="45" height="260" rx="2" fill="#15803d"/>
            <rect x="220" y="150" width="80" height="170" rx="2" fill="#15803d"/>
            <polygon points="380,200 420,160 460,200" fill="#15803d"/>
            <rect x="385" y="200" width="70" height="120" rx="1" fill="#15803d"/>
            <rect x="1050" y="100" width="50" height="220" rx="2" fill="#15803d"/>
            <rect x="1130" y="80" width="55" height="240" rx="2" fill="#15803d"/>
            <rect x="1220" y="160" width="90" height="160" rx="2" fill="#15803d"/>
            <rect x="0" y="318" width="1440" height="2" fill="#15803d" opacity="0.1"/>
        </svg>
    </div>
);

const FloatingElements = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] left-[8%] animate-float-slow opacity-[0.06]"><div className="document-symbol text-primary"></div></div>
        <div className="absolute top-[55%] left-[5%] animate-float opacity-[0.25]" style={{animationDelay: '1s'}}><div className="stamp-float"></div></div>
        <div className="absolute top-[50%] right-[6%] animate-float-slow opacity-[0.15]" style={{animationDelay: '2s'}}><div className="building-symbol text-primary"></div></div>
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

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const navbarHeight = 80;
            const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative pt-0 pb-4 lg:pt-0 lg:pb-6 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/hero-bg.png" alt="Architecture" className="w-full h-full object-cover opacity-[0.2]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white"></div>
            </div>
            <ServiceRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} serviceName={selectedService} />
            <FloatingElements />
            <CitySkyline />
            <div className="absolute inset-0 blueprint-grid pointer-events-none z-0 opacity-[0.4]"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto pt-20 md:pt-28">
                    <div className="min-h-[160px] md:min-h-[200px] flex items-center justify-center mb-6">
                        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight transition-all duration-1000 ${fade ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 -translate-y-8 scale-95 blur-sm'}`}>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-green-600 to-primary/80">
                                {titles[titleIndex]}
                            </span>
                        </h1>
                    </div>
                    <p className="text-lg md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
                        Avoid delays, agents, and office visits. Bengaluru's premier property legal execution team.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={() => scrollToSection('services')} className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-xl hover:shadow-primary/20 flex items-center gap-3 group">
                            <span>Explore Our Services</span>
                            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <a href="tel:9019786255" className="px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-black text-lg hover:border-primary transition-all shadow-sm">Call Expert Now</a>
                    </div>
                    <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-60">
                        <div className="flex items-center gap-2"><ShieldCheck size={20} className="text-primary" /><span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Legal Verified</span></div>
                        <div className="flex items-center gap-2"><FileText size={20} className="text-primary" /><span className="text-sm font-bold text-gray-500 uppercase tracking-widest">10k+ Delivered</span></div>
                        <div className="flex items-center gap-2"><Users size={20} className="text-primary" /><span className="text-sm font-bold text-gray-500 uppercase tracking-widest">100% Transparent</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
