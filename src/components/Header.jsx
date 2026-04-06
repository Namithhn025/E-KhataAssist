import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import logo from '../assets/logo-clean.png';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Home', href: '/', isLink: true, onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
        { label: 'Services', href: '/#services' },
        { label: 'About Us', href: '/#about' },
        { label: 'Blogs', href: '/blogs', isLink: true },
        { label: 'FAQ', href: '/#faq' },
        { label: 'Contact', href: '/#contact' },
    ];

    return (
        <nav
            className="sticky top-0 z-50 transition-all duration-500"
            style={{
                background: scrolled
                    ? 'linear-gradient(135deg, rgba(5,28,16,0.98) 0%, rgba(6,54,35,0.98) 50%, rgba(4,38,24,0.98) 100%)'
                    : 'linear-gradient(135deg, #051c10 0%, #063623 50%, #041814 100%)',
                backdropFilter: 'blur(20px)',
                boxShadow: scrolled
                    ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(34,197,94,0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(34,197,94,0.08)',
            }}
        >
            {/* Subtle dot pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(34,197,94,0.06) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Top shimmer line */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.6) 30%, rgba(74,222,128,0.9) 50%, rgba(34,197,94,0.6) 70%, transparent 100%)',
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex justify-between h-20 items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-md group-hover:bg-green-400/30 transition-all" />
                            <img src={logo} alt="E-KhataAssist Logo" className="h-12 w-auto brightness-0 invert relative z-10" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-xl font-black text-white tracking-tight">
                                E Khata <span style={{
                                    background: 'linear-gradient(90deg, #4ade80, #22c55e, #86efac)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>Assist</span>
                            </span>
                            <span className="text-[10px] text-green-400/60 font-bold uppercase tracking-[0.2em]">Bengaluru's Trusted</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            link.isLink ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={(e) => {
                                        if (link.onClick) link.onClick(e);
                                    }}
                                    className="relative px-4 py-2 text-gray-300 text-sm font-semibold hover:text-white transition-all group"
                                >
                                    {link.label}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-green-400 group-hover:w-4/5 transition-all duration-300 rounded-full" />
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => {
                                        if (link.onClick) link.onClick(e);
                                    }}
                                    className="relative px-4 py-2 text-gray-300 text-sm font-semibold hover:text-white transition-all group"
                                >
                                    {link.label}
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-green-400 group-hover:w-4/5 transition-all duration-300 rounded-full" />
                                </a>
                            )
                        ))}

                        {/* Glowing CTA Button */}
                        <a
                            href="tel:9019786255"
                            className="ml-4 relative group overflow-hidden"
                        >
                            <div
                                className="absolute inset-0 rounded-xl blur-md opacity-60 group-hover:opacity-90 transition-opacity"
                                style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)' }}
                            />
                            <div
                                className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold border border-green-400/30 group-hover:border-green-400/60 transition-all"
                                style={{ background: 'linear-gradient(135deg, #166534, #15803d)' }}
                            >
                                <Phone size={16} className="group-hover:rotate-12 transition-transform" />
                                <span>Request a Service</span>
                            </div>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white hover:text-green-400 transition-colors p-2 rounded-lg border border-white/10 hover:border-green-400/30 hover:bg-white/5"
                    >
                        {isOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div
                    className="md:hidden border-t border-white/10 pb-4"
                    style={{ background: 'linear-gradient(180deg, #063623 0%, #041810 100%)' }}
                >
                    <div className="px-4 pt-3 pb-2 space-y-1">
                        {navLinks.map((link) => (
                            link.isLink ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={(e) => {
                                        setIsOpen(false);
                                        if (link.onClick) link.onClick(e);
                                    }}
                                    className="flex items-center px-4 py-3 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => {
                                        setIsOpen(false);
                                        if (link.onClick) link.onClick(e);
                                    }}
                                    className="flex items-center px-4 py-3 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                        <div className="pt-3 px-1">
                            <a
                                href="tel:9019786255"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white text-sm border border-green-500/30 transition-all"
                                style={{ background: 'linear-gradient(135deg, #166534, #15803d)' }}
                            >
                                <Phone size={16} />
                                Request a Service
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
