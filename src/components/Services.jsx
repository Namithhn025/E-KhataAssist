import React, { useState } from 'react';
import { FileText, Home, Users, Zap, PenTool, CheckCircle } from 'lucide-react';
import ServiceRequestModal from './ServiceRequestModal';

const services = [
    { icon: FileText, title: 'E-Khata Issuance', desc: 'Get your Form 9 & 11A issued quickly.' },
    { icon: CheckCircle, title: 'Encumbrance Cert', desc: 'Get EC for your property easily.' },
    { icon: Users, title: 'Khata Transfer', desc: 'Seamless ownership transfer process.' },
    { icon: Zap, title: 'BESCOM Services', desc: 'Name change and load enhancement.' },
    { icon: PenTool, title: 'Rental Agreements', desc: 'Drafting and registration of rent deeds.' },
    { icon: Home, title: 'Property Tax', desc: 'Calculation and payment assistance.' },
];

const Services = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');

    const handleServiceClick = (title) => {
        setSelectedService(title);
        setIsModalOpen(true);
    };

    return (
        <div id="services" className="py-24 bg-white">
            <ServiceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                serviceName={selectedService}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        All Property Services You Need, In One Place
                    </h2>
                    <p className="text-gray-600">
                        From documentation to legal verification, we handle everything so you don't have to.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="p-6 bg-white border border-gray-100 rounded-xl hover:shadow-xl transition-shadow duration-300">
                            <div className="w-12 h-12 bg-green-50 text-primary rounded-lg flex items-center justify-center mb-4">
                                <service.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                            <p className="text-gray-600 mb-4">{service.desc}</p>
                            <button
                                onClick={() => handleServiceClick(service.title)}
                                className="text-primary font-medium hover:underline text-sm uppercase tracking-wide"
                            >
                                Apply Now &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;
