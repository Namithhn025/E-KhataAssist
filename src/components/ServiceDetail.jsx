import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, CheckCircle2, ShieldCheck, 
    FileSearch, Send, Settings, Sparkles, Lock
} from 'lucide-react';
import ServiceRequestForm from './ServiceRequestForm';
import { servicesData } from '../data/servicesData';

const ServiceDetail = () => {
    const { serviceId } = useParams();
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    // Find the service from data
    const service = servicesData.find(s => s.id === serviceId);

    // SEO: Updated title and description for service detail page
    useEffect(() => {
        if (service) {
            document.title = `${service.title} Services in Bengaluru | E-KhataAssist`;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute("content", service.description || `Professional ${service.title} services for property owners in Bengaluru. Fast processing and expert assistance.`);
            }
        }
    }, [service]);

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
                    <Link to="/" className="text-primary hover:underline">Return Home</Link>
                </div>
            </div>
        );
    }

    const Icon = service.icon;

    return (
        <div className="min-h-screen bg-[#fcfdfd] pt-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navigation */}
                <Link 
                    to="/#services"
                    className="group inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-12 transition-all font-bold"
                >
                    <div className="p-2 rounded-full bg-white shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </div>
                    <span>Back to Services</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-7 space-y-16">
                        {/* Header Details */}
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-[2px] w-8 bg-primary"></div>
                                <span className="text-xs uppercase tracking-[0.3em] font-black text-primary">
                                    {service.category} Service
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-[1.1]">
                                {service.title}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-6 mb-10">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Starting from</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-black text-primary italic">₹{service.price}*</span>
                                        <span className="text-xl text-gray-300 line-through font-bold">₹{service.originalPrice}</span>
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-gray-100 hidden md:block"></div>
                                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                    <ShieldCheck size={18} className="text-primary" />
                                    <span className="text-sm font-bold text-green-800">100% Verified Experts</span>
                                </div>
                            </div>
                        </div>

                        {/* Overview Section */}
                        <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                                <Sparkles size={120} className="text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <Icon size={28} className="text-primary" />
                                Overview
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                {service.overview}
                            </p>
                        </section>

                        {/* Use Cases Section */}
                        <section className="space-y-8">
                            <h2 className="text-2xl font-black text-gray-900 ml-4">When you'll need this</h2>
                            <div className="flex flex-wrap gap-4 px-2">
                                {service.useCases.map((useCase, idx) => (
                                    <div 
                                        key={idx}
                                        className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all font-bold text-gray-700 flex items-center gap-3 group/tag"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary/20 group-hover/tag:bg-primary transition-all"></div>
                                        {useCase}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Documents Required & Process Section */}
                        <section className="space-y-12">
                            <h2 className="text-2xl font-black text-gray-900 ml-4">Documents Required & Process</h2>
                            
                            <div className="relative space-y-12 pl-4">
                                {/* Vertical Line Connection */}
                                <div className="absolute left-10 top-12 bottom-12 w-px bg-dashed border-l-2 border-dashed border-gray-200"></div>

                                {/* Step 1: Documents */}
                                <div className="relative flex gap-8 group">
                                    <div className="relative z-10 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-900/20 group-hover:scale-110 transition-transform">
                                        <FileSearch size={24} />
                                    </div>
                                    <div className="flex-grow pt-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-6">1. Gather Your Documents</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {service.documents.map((doc, idx) => (
                                                <div key={idx} className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                                                    <CheckCircle2 size={18} className="text-primary mt-0.5 shrink-0" />
                                                    <span className="text-sm font-bold text-gray-700 leading-snug">{doc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Sending */}
                                <div className="relative flex gap-8 group">
                                    <div className="relative z-10 w-12 h-12 bg-white border-2 border-primary text-primary rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                        <Send size={24} />
                                    </div>
                                    <div className="flex-grow pt-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-3">2. Send Your Documents</h3>
                                        <p className="text-sm text-gray-500 font-bold leading-relaxed max-w-lg">
                                            Share digital copies (Photos/PDFs) with our assigned legal expert via WhatsApp or Email. We'll verify them and prepare the documentation.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3: Handle the Rest */}
                                <div className="relative flex gap-8 group">
                                    <div className="relative z-10 w-12 h-12 bg-white border-2 border-primary text-primary rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                        <Settings size={24} className="animate-spin-slow" />
                                    </div>
                                    <div className="flex-grow pt-1">
                                        <h3 className="text-xl font-black text-gray-900 mb-3">3. We Handle The Rest</h3>
                                        <p className="text-sm text-gray-500 font-bold leading-relaxed max-w-lg">
                                            Sit back while we handle government coordination, field verification, and follow-ups. We'll deliver your verified certificate to your doorstep.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Form */}
                    <div className="lg:col-span-5 relative">
                        <div className="sticky top-32">
                            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-green-900/10 border border-green-50 ring-1 ring-black/5 overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 vault-gradient"></div>
                                <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight">
                                    Apply for <br />
                                    <span className="text-primary italic">{service.title}</span> now
                                </h3>
                                <ServiceRequestForm serviceName={service.title} />
                            </div>

                            {/* Trust Badge Below Form */}
                            <div className="mt-8 px-8 py-6 bg-green-950 rounded-3xl text-white flex items-center gap-6 shadow-xl vault-gradient relative overflow-hidden group">
                                <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12 group-hover:scale-150 transition-transform duration-700">
                                    <ShieldCheck size={120} />
                                </div>
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                    <Lock size={24} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-widest font-black text-green-400 mb-1">Secure & Trusted</p>
                                    <p className="text-sm font-bold text-white/90">Zero advance payment required. Pay only after work completion.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add rotation animation for the settings icon
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
`;
document.head.appendChild(style);

export default ServiceDetail;
