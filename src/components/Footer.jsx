import React, { useState } from 'react';
import { MessageCircle, FileText, Phone, Mail, Linkedin, Instagram, Facebook, MapPin } from 'lucide-react';

const ContactFooter = () => {
    const [selectedService, setSelectedService] = useState('');

    const handleWhatsAppRedirect = (e) => {
        e.preventDefault();
        if (!selectedService) return;
        const message = `Hi, I am interested in ${selectedService}. Please assist me.`;
        const url = `https://wa.me/918088917577?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <footer id="contact" className="relative text-white pt-24 pb-10 overflow-hidden scroll-mt-52"
            style={{ background: 'linear-gradient(135deg, #051c10 0%, #063623 50%, #041814 100%)' }}
        >
            {/* Dot pattern overlay */}
            <div className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.06) 1px, transparent 1px)',
                    backgroundSize: '28px 28px'
                }}
            />
            {/* Top shimmer line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5) 30%, rgba(74,222,128,0.8) 50%, rgba(34,197,94,0.5) 70%, transparent)' }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* ── Contact CTA Card ── */}
                <div className="relative -mt-24 md:-mt-36 mb-20 rounded-3xl overflow-hidden shadow-2xl mx-1 md:mx-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,253,244,0.97) 100%)',
                        border: '1px solid rgba(21,128,61,0.15)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
                    }}
                >
                    {/* Top accent */}
                    <div className="h-1.5 w-full"
                        style={{ background: 'linear-gradient(90deg, #15803d, #22c55e, #86efac, #22c55e, #15803d)' }}
                    />
                    <div className="p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12">
                        {/* Left copy */}
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                                style={{ background: 'linear-gradient(135deg, #052c16, #064e3b)', color: '#4ade80' }}
                            >
                                <Phone size={12} />
                                <span>Get In Touch</span>
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
                                Ready to get <span className="text-primary italic">started?</span>
                            </h3>
                            <p className="text-gray-500 text-base font-medium">
                                Select a service and reach out to us instantly via WhatsApp or fill a simple form.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 text-sm text-gray-700">
                                <a href="tel:9019786255" className="flex items-center gap-2 hover:text-primary transition-all font-bold">
                                    <Phone size={16} className="text-primary shrink-0" /> +91 90197 86255
                                </a>
                                <a href="tel:8088917577" className="flex items-center gap-2 hover:text-primary transition-all font-bold">
                                    <Phone size={16} className="text-primary shrink-0" /> +91 80889 17577
                                </a>
                                <a href="mailto:info@ekhataassist.in" className="flex items-center gap-2 hover:text-primary transition-all font-bold">
                                    <Mail size={16} className="text-primary shrink-0" /> info@ekhataassist.in
                                </a>
                                <a href="mailto:services@ekhataassist.com" className="flex items-center gap-2 hover:text-primary transition-all font-bold">
                                    <Mail size={16} className="text-primary shrink-0" /> services@ekhataassist.com
                                </a>
                                <div className="flex items-start gap-2 text-gray-500 font-medium">
                                    <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                                    <span>2 nd floor, No 8, Siddedahalli Main Road, Opp Government School, Siddedahalli, Near Nagasandra Metro station, Bengaluru -560073</span>
                                </div>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="flex-1 w-full max-w-md rounded-2xl p-6 border"
                            style={{
                                background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)',
                                borderColor: 'rgba(21,128,61,0.12)'
                            }}
                        >
                            <form onSubmit={handleWhatsAppRedirect} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Select Service</label>
                                    <select
                                        className="w-full p-3 rounded-xl text-gray-800 text-sm font-medium transition-all outline-none"
                                        style={{
                                            border: '1.5px solid rgba(21,128,61,0.2)',
                                            background: 'white'
                                        }}
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose a service --</option>
                                        <option value="E-Khata">E-Khata</option>
                                        <option value="MODT Closure / Loan Closure">MODT Closure / Loan Closure</option>
                                        <option value="Khata Transfer">Khata Transfer</option>
                                        <option value="Rental & Lease Agreement">Rental & Lease Agreement</option>
                                        <option value="Registry of Property">Registry of Property</option>
                                        <option value="MOU Services">MOU Services</option>
                                        <option value="Family Tree">Family Tree</option>
                                        <option value="BESCOM Name Change">BESCOM Name Change</option>
                                        <option value="Property Tax Payment">Property Tax Payment</option>
                                        <option value="Legal Consultation">Legal Consultation</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02]"
                                    style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)' }}
                                >
                                    <MessageCircle size={18} />
                                    Connect on WhatsApp
                                </button>
                                <div className="text-center text-xs text-gray-400 font-semibold">OR</div>
                                <a
                                    href="https://docs.google.com/forms/d/e/1FAIpQLSdej1_c5eKMP2h138UKDXBysldAnLGO6EaE0iN574LL7bAIPQ/viewform?usp=header"
                                    target="_blank" rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-all hover:border-primary hover:text-primary text-gray-600"
                                    style={{ borderColor: 'rgba(0,0,0,0.1)', background: 'white' }}
                                >
                                    <FileText size={16} />
                                    Fill Enquiry Form
                                </a>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Footer Links ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 border-b pb-12"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-2xl font-black mb-3 tracking-tight"
                            style={{ background: 'linear-gradient(90deg, #4ade80, #86efac)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        >
                            E-KhataAssist
                        </h4>
                        <p className="text-sm font-medium max-w-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Simplifying property documentation for everyone. Secure, fast, and reliable services at your fingertips.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-black text-sm uppercase tracking-widest mb-4 text-green-400">Services</h5>
                        <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            {['E-Khata', 'MODT Closure / Loan Closure', 'Khata Transfer', 'Legal Documentation', 'Property Registry', 'Legal Consultation'].map(s => (
                                <li key={s}><a href="#services" className="hover:text-white transition-colors">{s}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-black text-sm uppercase tracking-widest mb-4 text-green-400">Contact</h5>
                        <ul className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                            <li className="flex items-center gap-2"><Mail size={13} className="text-green-400" /> info@ekhataassist.in</li>
                            <li className="flex items-center gap-2"><Mail size={13} className="text-green-400" /> services@ekhataassist.com</li>
                            <li className="flex items-center gap-2 font-bold text-white"><Phone size={13} className="text-green-400" /> +91 90197 86255</li>
                            <li className="flex items-center gap-2"><Phone size={13} /> +91 80889 17577</li>
                            <li className="flex items-start gap-2">
                                <MapPin size={13} className="text-green-400 shrink-0 mt-0.5" />
                                <span>2 nd floor, No 8, Siddedahalli Main Road, Opp Government School, Siddedahalli, Near Nagasandra Metro station, Bengaluru -560073</span>
                            </li>
                            <li className="flex gap-4 mt-5">
                                <a href="https://www.linkedin.com/company/ekhataassist/" target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10 border"
                                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}>LinkedIn</a>
                                <a href="https://www.instagram.com/ekhataassist?utm_source=qr&igsh=MWhuZGQ4aGFiZ25wMw==" target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10 border"
                                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Instagram</a>
                                <a href="https://www.facebook.com/share/1G1ftwKsNa/" target="_blank" rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-white/10 border"
                                    style={{ borderColor: 'rgba(255,255,255,0.15)' }}>Facebook</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 text-center text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    © 2025 E-KhataAssist. All rights reserved. | Done by Namith HN
                </div>
            </div>
        </footer>
    );
};

export default ContactFooter;
