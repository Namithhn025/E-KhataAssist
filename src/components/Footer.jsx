import React, { useState } from 'react';

const ContactFooter = () => {
    const [selectedService, setSelectedService] = useState('');

    const handleWhatsAppRedirect = (e) => {
        e.preventDefault();
        if (!selectedService) return;

        // Construct WhatsApp URL
        const message = `Hi, I am interested in ${selectedService}. Please assist me.`;
        const url = `https://wa.me/918088917577?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <footer className="bg-primary text-white pt-20 pb-10" id="contact">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Contact Form Area */}
                <div className="bg-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl relative -mt-32 mb-20 text-gray-900">
                    <div className="flex-1">
                        <h3 className="text-3xl font-bold text-primary mb-4">Ready to get started?</h3>
                        <p className="text-gray-600 text-lg">
                            Select a service and reach out to us instantly via WhatsApp or filling a simple form.
                        </p>
                    </div>
                    <div className="flex-1 w-full max-w-md bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <form onSubmit={handleWhatsAppRedirect} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
                                <select
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a service --</option>
                                    <option value="E-Khata">E-Khata</option>
                                    <option value="Khata Transfer">Khata Transfer</option>
                                    <option value="Rental Agreement">Rental Agreement</option>
                                    <option value="Legal Opinion">Legal Opinion</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-green-800 transition-colors"
                            >
                                Connect on WhatsApp
                            </button>
                            <div className="text-center text-sm text-gray-500">
                                OR
                            </div>
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSdej1_c5eKMP2h138UKDXBysldAnLGO6EaE0iN574LL7bAIPQ/viewform?usp=header"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full block text-center bg-white border border-gray-300 text-gray-700 py-3 rounded-md font-bold hover:bg-gray-50 transition-colors"
                            >
                                Fill Enquiry Form
                            </a>
                        </form>
                    </div>
                </div>

                {/* Footer Links */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/20 pb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h4 className="text-2xl font-bold mb-4">E-KhataAssist</h4>
                        <p className="text-green-100 max-w-sm">
                            Simplifying property documentation for everyone. Secure, fast, and reliable services at your fingertips.
                        </p>
                    </div>
                    <div>
                        <h5 className="font-bold text-lg mb-4">Services</h5>
                        <ul className="space-y-2 text-green-100">
                            <li><a href="#" className="hover:text-white">E-Khata</a></li>
                            <li><a href="#" className="hover:text-white">Transfers</a></li>
                            <li><a href="#" className="hover:text-white">Legal Verification</a></li>
                            <li><a href="#" className="hover:text-white">Agreements</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-lg mb-4">Contact</h5>
                        <ul className="space-y-2 text-green-100">
                            <li>info@ekhataassist.in</li>
                            <li>+91 80889 17577</li>
                            <li className="flex gap-4 mt-4">
                                <a href="https://www.linkedin.com/company/ekhataassist/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100">LinkedIn</a>
                                <a href="https://www.instagram.com/ekhataassist?utm_source=qr&igsh=MWhuZGQ4aGFiZ25wMw==" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100">Instagram</a>
                                <a href="https://www.facebook.com/share/1G1ftwKsNa/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100">Facebook</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 text-center text-green-200 text-sm">
                    &copy; {new Date().getFullYear()} E-KhataAssist. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default ContactFooter;
