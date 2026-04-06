import React from 'react';
import { Zap, Scale, MapPin, CheckCircle, Target, Eye, Shield, ShieldCheck } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-20 overflow-hidden relative scroll-mt-20"
            style={{
                background: 'linear-gradient(180deg, #f8fafc 0%, #f0fdf4 30%, #ffffff 60%, #f0fdf4 100%)',
                backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(21,128,61,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(34,197,94,0.05) 0%, transparent 50%)'
            }}
        >
            {/* Background elements */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.2] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-green-50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-[20%] left-[10%] building-symbol text-primary opacity-[0.04] -z-0"></div>
            <div className="absolute bottom-[20%] right-[10%] document-symbol text-primary opacity-[0.04] -z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-primary text-xs font-black mb-6 uppercase tracking-widest border border-green-100">
                        <span>EST. 2025</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter">
                        The Story of <br />
                        <span className="text-primary italic">E-Khata Assist</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
                        Redefining property ownership and legal documentation in Bengaluru through transparency and absolute trust.
                    </p>
                </div>

                {/* Core Advantages */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    {[
                        { icon: Zap, title: "Unmatched Speed", desc: "No more waiting for weeks. Our streamlined process ensures your documents are moving from Day 1.", color: '#15803d', light: '#f0fdf4' },
                        { icon: Scale, title: "Legal Integrity", desc: "Backed by legal professionals who understand the fine print of Karnataka property laws.", color: '#0369a1', light: '#eff6ff' },
                        { icon: MapPin, title: "Local Presence", desc: "We are physically present at sub-registrar offices and BBMP centers to ensure work gets done.", color: '#7c3aed', light: '#f5f3ff' }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx} className="relative p-8 rounded-3xl border vault-card-hover group overflow-hidden"
                                style={{
                                    background: 'rgba(255,255,255,0.9)',
                                    borderColor: 'rgba(0,0,0,0.07)',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.05)'
                                }}
                            >
                                {/* Top gradient accent bar */}
                                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                                    style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`, opacity: 0.6 }}
                                />
                                {/* Background glow on hover */}
                                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at 30% 30%, ${item.light}, transparent 70%)` }}
                                />
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-sm"
                                        style={{ background: item.light, color: item.color }}
                                    >
                                        <Icon size={26} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed text-sm font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Our Story Section */}
                <div className="grid lg:grid-cols-12 gap-20 items-stretch mb-32 font-medium">
                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="inline-block h-1 w-20 bg-primary mb-8 rounded-full"></div>
                        <h2 className="text-4xl font-black text-gray-900 mb-10 tracking-tight leading-tight">
                            Why We Exist: <br />
                            <span className="text-primary italic">Solving the Property Struggle</span>
                        </h2>
                        <div className="space-y-8 text-lg text-gray-600 leading-relaxed">
                            <p>
                                Property ownership in Bengaluru should be a moment of pride—but for years, it has been a source of anxiety. Confusing portals, middlemen, and a lack of transparency made the simple task of documentation feel impossible.
                            </p>
                            <p>
                                <span className="text-gray-900 font-bold underline decoration-primary decoration-4 underline-offset-4">E-Khata Assist was born in the field, not a boardroom.</span> Our founder, Ajaykumar H, saw firsthand the exhaustion of homeowners trying to secure documents that legally belonged to them.
                            </p>
                            <p className="bg-green-50 p-6 rounded-2xl border-l-4 border-primary text-gray-900 italic font-bold">
                                "Our mission is simple: to provide a secure digital vault and on-ground execution team that treats your property documentation with the urgency it deserves."
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-5 vault-gradient text-white p-12 rounded-[3rem] relative overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-8 tracking-tight">The Impact</h3>
                            <ul className="space-y-8 mb-12">
                                {[
                                    '100% Transparent Pricing',
                                    'Zero Advance Payments',
                                    'Real-time Status Updates',
                                    'End-to-end Legal Support'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-xl font-bold tracking-tight">
                                        <div className="w-8 h-8 bg-green-400 text-green-950 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                                            <CheckCircle size={18} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="relative z-10 pt-12 border-t border-white/20">
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <div className="text-4xl font-black tracking-tighter mb-1">2k+</div>
                                    <div className="text-green-300 text-xs font-black uppercase tracking-widest opacity-80">Documents</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black tracking-tighter mb-1">1.2k+</div>
                                    <div className="text-green-300 text-xs font-black uppercase tracking-widest opacity-80">Happy NRIs</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black tracking-tighter mb-1">1.5k+</div>
                                    <div className="text-green-300 text-xs font-black uppercase tracking-widest opacity-80">Properties</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black tracking-tighter mb-1">50+</div>
                                    <div className="text-green-300 text-xs font-black uppercase tracking-widest opacity-80">Partners</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* The Promise */}
                <div className="bg-gray-950 text-white rounded-[3.5rem] p-12 md:p-24 relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #22c55e 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="max-w-2xl text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-black mb-6 uppercase tracking-widest border border-primary/20">
                                <Shield size={14} />
                                <span>Secured by Experts</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter leading-tight">
                                The E-Khata Assist <br />
                                <span className="text-primary italic">Golden Promise</span>
                            </h2>
                            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl">
                                We don’t just process documents—we stand with property owners as their legal guardians. No false commitments, no hidden charges, and absolute honesty.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {['No Hidden Fees', 'Live Tracking', 'On-ground Execution'].map(tag => (
                                    <span key={tag} className="px-6 py-3 bg-white/5 rounded-2xl text-sm font-black tracking-widest uppercase border border-white/10 text-gray-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="w-32 h-32 bg-primary rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.3)] animate-float transform rotate-12">
                            <ShieldCheck size={56} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default About;
