import React from 'react';
import { Zap, Scale, MapPin, CheckCircle, Target, Eye, Shield } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-3">About Us</h2>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        E-Khata Assist
                    </h1>
                    <p className="text-2xl md:text-3xl text-primary font-medium italic mb-8">
                        Simple. Transparent. Trusted Property Solutions.
                    </p>
                </div>

                {/* Core Advantages */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    <div className="bg-green-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 text-primary shadow-sm">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Fast & Reliable</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Property documents processed and delivered in as little as 24–48 hours, without unnecessary delays.
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-primary">
                            <Scale size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Trusted Legal Expertise</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Every step is guided by experienced property law professionals and a dedicated on-ground execution team.
                        </p>
                    </div>
                    <div className="bg-green-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 text-primary shadow-sm">
                            <MapPin size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Local Expertise & Support</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Services designed exclusively for Bengaluru residents, with multi-language assistance and 24x7 support.
                        </p>
                    </div>
                </div>

                {/* Our Story Section */}
                <div className="grid lg:grid-cols-12 gap-16 items-start mb-24">
                    <div className="lg:col-span-7">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-primary pl-6">
                            Why E-Khata Assist Exists
                        </h2>
                        <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                            <p>
                                Property ownership in Bengaluru should be empowering—but for years, it hasn’t been.
                            </p>
                            <p>
                                Homeowners have been forced to run from office to office, deal with confusing government portals, face unclear procedures, and depend on agents who charged exorbitant fees, delayed work, or demanded unofficial payments.
                            </p>
                            <p>
                                Even established companies turned this struggle into a money-making race, leaving genuine property owners with no transparency and no real choice.
                            </p>
                            <p className="font-semibold text-primary text-xl mt-8">
                                E-Khata Assist was born to change this reality.
                            </p>
                        </div>

                        <div className="mt-12 p-8 bg-gray-50 rounded-2xl border-l-4 border-primary">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story — From the Ground, Not a Boardroom</h3>
                            <p className="text-gray-700 mb-6 italic">
                                "Ajay witnessed homeowners exhausted—financially and emotionally—just to secure documents that legally belonged to them."
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Ajaykumar H, our Founder, comes from a legal background and recognized that despite technology, people were still paying huge amounts for basic documentation and receiving zero updates. He started by helping cases one-by-one, and that solution-driven ethos is at the core of everything we do today.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-primary text-white p-10 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-8">Trusted by 1,000+ Customers</h3>
                            <ul className="space-y-6">
                                {[
                                    'Transparent pricing',
                                    'No advance payments',
                                    'Regular status updates',
                                    'End-to-end assistance'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-lg">
                                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                            <CheckCircle size={16} className="text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-12 pt-12 border-t border-white/20">
                                <h4 className="text-xl font-bold mb-6 italic">Our Impact (So Far)</h4>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <div className="text-3xl font-bold">2,000+</div>
                                        <div className="text-green-200 text-sm">Documents Delivered</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">1,200+</div>
                                        <div className="text-green-200 text-sm">Happy Customers</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">1,500+</div>
                                        <div className="text-green-200 text-sm">Properties Serviced</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">50+</div>
                                        <div className="text-green-200 text-sm">Trusted Partners</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                </div>

                {/* Vision & Mission */}
                <div className="grid md:grid-cols-2 gap-12 mb-24">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-green-50 rounded-3xl -rotate-1 group-hover:rotate-0 transition-transform duration-300"></div>
                        <div className="relative bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-8 text-primary">
                                <Eye size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                To become Bengaluru’s most trusted, all-in-one property documentation partner, delivering transparency, reliability, and peace of mind to every property owner.
                            </p>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/5 rounded-3xl rotate-1 group-hover:rotate-0 transition-transform duration-300"></div>
                        <div className="relative bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-primary">
                                <Target size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                To eliminate confusion in property documentation, provide legal solutions at fair pricing, and replace uncertainty with clarity and trust.
                            </p>
                        </div>
                    </div>
                </div>

                {/* The Promise */}
                <div className="bg-gray-900 text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="max-w-2xl text-center md:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">The E-Khata Assist Promise</h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                We don’t just process documents—we stand with property owners. No false commitments, no hidden charges, and no unnecessary delays.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {['No Hidden Charges', 'Legal Expertise', 'On-ground Execution'].map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                            <Shield size={48} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
