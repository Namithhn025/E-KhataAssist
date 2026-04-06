import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, Lock, ArrowRight, Info
} from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';
import { servicesData } from '../data/servicesData';

const Services = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleApplyClick = (title) => {
        setSelectedService(title);
        setIsModalOpen(true);
    };

    return (
        <div id="services" className="pt-12 pb-20 relative overflow-hidden reveal scroll-mt-20" style={{background: 'linear-gradient(to bottom, #064e3b 0%, #0a6644 8%, #f0fdf4 30%, #f8fafc 100%)'}}>
            {/* Background Accents */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.2] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-[300px] opacity-[0.4] pointer-events-none" style={{position:'absolute'}}></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

            <ServiceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serviceName={selectedService}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-4xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-black mb-4 uppercase tracking-[0.2em] border border-white/30">
                        <Lock size={14} className="animate-pulse" />
                        <span>The E-Khata Digital Vault</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                        Complete Property Legality <br />
                        <span className="text-green-300 italic">In One Secure Place</span>
                    </h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto font-medium">
                        The gold standard in Bengaluru property documentation. Verified experts, on-ground execution, and 100% transparency.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicesData.map((service, index) => {
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
                                
                                {/* Building Background Accent */}
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 card-building-icon opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:-rotate-6 group-hover:scale-125 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-16 h-16 bg-green-50 text-primary rounded-2xl flex items-center justify-center mb-8 border border-green-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                                        {Icon ? <Icon size={32} /> : <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />}
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

                                    <div className="flex flex-col gap-3 mt-auto">
                                        <Link
                                            to={`/services/${service.id}`}
                                            className="inline-flex items-center gap-3 px-8 py-4 font-bold rounded-2xl w-full justify-center group/btn transition-all duration-300 relative overflow-hidden"
                                            style={{
                                                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                                color: '#15803d',
                                                border: '1.5px solid rgba(21,128,61,0.2)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #dcfce7, #bbf7d0)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'linear-gradient(135deg, #f0fdf4, #dcfce7)'}
                                        >
                                            <Info size={18} />
                                            <span>Know More</span>
                                            <ArrowRight size={16} className="ml-auto group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                        <button
                                            onClick={() => handleApplyClick(service.title)}
                                            className="inline-flex items-center gap-3 px-8 py-4 bg-green-50 text-primary font-black rounded-2xl hover:bg-primary hover:text-white transition-all duration-300 w-full justify-center group/btn shadow-sm"
                                        >
                                            <span>Apply Now</span>
                                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
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
