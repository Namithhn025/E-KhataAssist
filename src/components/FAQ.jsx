import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Is E-Khata Assist operational in all areas of Bengaluru?",
        answer: "Yes, we cover both urban and rural Bengaluru. Whether your property comes under Bruhat Bengaluru Mahanagara Palike (BBMP), BDA, or Gram Panchayat (Form 9 & 11), we can assist you with all property legal requirements."
    },
    {
        question: "Can I use your services if I am an NRI or living outside Bengaluru?",
        answer: "Absolutely! A significant number of our clients are NRIs or individuals residing outside Bengaluru. We manage the entire process digitally and coordinate with local authorities so you don't have to travel."
    },
    {
        question: "How do I get started with a service?",
        answer: "Getting started is simple. You can click 'Apply Now' on any service, or contact us via WhatsApp/Call at +91 90197 86255 or +91 80889 17577. Share your property details, and we'll guide you on the specific documents required."
    },
    {
        question: "Will I receive regular updates on my request?",
        answer: "Yes, transparency is our priority. You will receive regular updates via WhatsApp, email, or phone. You can also reach out to our team anytime for a status check."
    },
    {
        question: "How long does it typically take to get an E-Khata?",
        answer: "The timeline depends on the complexity and the specific authority involved. On average, an E-Khata issuance takes about 15–20 working days. We provide a transparent estimate once we review your initial documents."
    },
    {
        question: "Do I need to visit government offices in person?",
        answer: "In most cases, no. Our on-ground team handles all the paperwork and visits to government offices. If your physical presence is mandatory for things like final signatures at the sub-registrar office, we will inform you well in advance and help you plan."
    },
    {
        question: "Are there any hidden charges?",
        answer: "None at all. We believe in upfront, transparent pricing. All costs involved will be communicated to you before we begin the work, and we don't demand full payments in advance for most services."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="faq" className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.2] pointer-events-none"></div>
            <div className="absolute top-20 right-10 stamp-float opacity-[0.05] -z-0"></div>
            <div className="absolute bottom-20 left-10 building-symbol text-primary opacity-[0.03] -z-0"></div>
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
                        <HelpCircle size={14} />
                        <span>FAQ</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Your trusted guide to property, legal compliance, and documentation in Karnataka.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-2xl transition-all duration-300 ${openIndex === index ? 'border-primary bg-green-50/30' : 'border-gray-200 hover:border-green-200'}`}
                        >
                            <button
                                className="w-full flex items-center justify-between p-6 text-left"
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                            >
                                <span className={`text-lg font-bold ${openIndex === index ? 'text-primary' : 'text-gray-900'}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp size={20} className="text-primary" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-6 text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
