import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

import logo from '../assets/logo-clean.png';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-green-950/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                            <img src={logo} alt="E-KhataAssist Logo" className="h-16 w-auto brightness-0 invert" />
                            <span className="text-2xl font-bold text-white tracking-tight">E Khata <span className="text-green-400">Assist</span></span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-white font-semibold hover:text-green-400 transition-colors">Home</Link>
                        <a href="/#services" className="text-gray-300 font-medium hover:text-white transition-colors">Services</a>
                        <a href="/#about" className="text-gray-300 font-medium hover:text-white transition-colors">About Us</a>
                        <Link to="/blogs" className="text-gray-300 font-medium hover:text-white transition-colors">Blogs</Link>
                        <a href="/#faq" className="text-gray-300 font-medium hover:text-white transition-colors">FAQ</a>
                        <a href="/#contact" className="text-gray-300 font-medium hover:text-white transition-colors">Contact</a>

                        <a
                            href="tel:9019786255"
                            className="bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-green-600 transition-all flex items-center gap-2 border border-white/10"
                        >
                            <Phone size={18} />
                            Request a Service
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-primary focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-green-950/98 backdrop-blur-xl border-t border-white/5 pb-4">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-green-400 font-semibold bg-white/5 rounded-md">Home</Link>
                        <a href="/#services" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-md">Services</a>
                        <a href="/#about" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-md">About Us</a>
                        <Link to="/blogs" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-md">Blogs</Link>
                        <a href="/#faq" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-md">FAQ</a>
                        <a href="/#contact" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-300 font-medium hover:text-white hover:bg-white/5 rounded-md">Contact</a>
                        <div className="pt-4 px-3">
                            <a
                                href="tel:9019786255"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-green-600 transition-all border border-white/10"
                            >
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
