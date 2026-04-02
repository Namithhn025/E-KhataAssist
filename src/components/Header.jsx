import React, { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';

import logo from '../assets/logo-clean.png';

const Header = ({ onHomeClick, isDetailView }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleNavClick = (e, target) => {
        // If it's a "Home" link or Logo
        if (target === '/' || target === '#') {
            e.preventDefault();
            onHomeClick();
            setIsOpen(false);
            return;
        }

        // If we are in detail view and clicking an anchor link (#services, etc)
        if (isDetailView) {
            onHomeClick(); // Switch back to landing page
            setIsOpen(false);
            // We don't prevent default here so the URL hash changes, 
            // which usually triggers a jump once the landing page re-renders.
        } else {
            // On landing page already, just close mobile menu if open
            setIsOpen(false);
        }
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <a href="/" onClick={(e) => handleNavClick(e, '/')} className="flex items-center gap-3">
                            <img src={logo} alt="E-KhataAssist Logo" className="h-16 w-auto" />
                            <span className="text-2xl font-bold text-primary tracking-tight">E Khata Assist</span>
                        </a>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#" onClick={(e) => handleNavClick(e, '#')} className="text-primary font-semibold hover:text-green-700">Home</a>
                        <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="text-gray-600 font-medium hover:text-primary">Services</a>
                        <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="text-gray-600 font-medium hover:text-primary">About Us</a>
                        <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className="text-gray-600 font-medium hover:text-primary">FAQ</a>
                        <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-gray-600 font-medium hover:text-primary">Contact</a>

                        <a
                            href="tel:9019786255"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-green-800 transition-colors flex items-center gap-2"
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
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="#" onClick={(e) => handleNavClick(e, '#')} className="block px-3 py-2 text-primary font-semibold bg-green-50 rounded-md">Home</a>
                        <a href="#services" onClick={(e) => handleNavClick(e, '#services')} className="block px-3 py-2 text-gray-600 font-medium hover:text-primary hover:bg-green-50 rounded-md">Services</a>
                        <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="block px-3 py-2 text-gray-600 font-medium hover:text-primary hover:bg-green-50 rounded-md">About Us</a>
                        <a href="#faq" onClick={(e) => handleNavClick(e, '#faq')} className="block px-3 py-2 text-gray-600 font-medium hover:text-primary hover:bg-green-50 rounded-md">FAQ</a>
                        <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="block px-3 py-2 text-gray-600 font-medium hover:text-primary hover:bg-green-50 rounded-md">Contact</a>
                        <a
                            href="tel:9019786255"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center mt-4 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-green-800"
                        >
                            Request a Service
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
