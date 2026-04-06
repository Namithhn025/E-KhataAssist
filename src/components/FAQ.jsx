import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, MessageCircle } from 'lucide-react';

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
        <section id="faq" className="py-20 relative overflow-hidden scroll-mt-20"
            style={{
                background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%, #f8fafc 100%)',
            }}
        >
            {/* Background Decorations */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.15] pointer-events-none"></div>
            
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.08) 0%, transparent 70%)' }}
            />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black mb-5 uppercase tracking-[0.2em] border"
                        style={{
                            background: 'linear-gradient(135deg, #052c16, #064e3b)',
                            color: '#4ade80',
                            borderColor: 'rgba(74,222,128,0.2)'
                        }}
                    >
                        <HelpCircle size={13} />
                        <span>FAQ</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Frequently Asked <span className="text-primary italic">Questions</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
                        Your trusted guide to property, legal compliance, and documentation in Karnataka.
                    </p>
                </div>

                {/* FAQ Items */}
                <div className="space-y-5">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`rounded-2xl transition-all duration-300 overflow-hidden ${
                                openIndex === index
                                    ? 'shadow-lg'
                                    : 'hover:shadow-md'
                            }`}
                            style={{
                                border: openIndex === index
                                    ? '1px solid rgba(21,128,61,0.25)'
                                    : '1px solid rgba(0,0,0,0.08)',
                                background: openIndex === index
                                    ? 'linear-gradient(135deg, rgba(240,253,244,0.9), rgba(255,255,255,0.9))'
                                    : 'rgba(255,255,255,0.8)',
                            }}
                        >
                            <button
                                className="w-full flex items-center justify-between px-6 py-5 text-left"
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                            >
                                <span className={`text-base font-bold pr-4 leading-snug ${openIndex === index ? 'text-primary' : 'text-gray-800'}`}>
                                    {faq.question}
                                </span>
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                                    style={{
                                        background: openIndex === index
                                            ? 'linear-gradient(135deg, #15803d, #22c55e)'
                                            : 'rgba(0,0,0,0.06)',
                                        color: openIndex === index ? 'white' : '#6b7280',
                                    }}
                                >
                                    {openIndex === index ? (
                                        <Minus size={16} strokeWidth={2.5} />
                                    ) : (
                                        <Plus size={16} strokeWidth={2.5} />
                                    )}
                                </div>
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-5 text-gray-600 leading-relaxed text-[15px] border-t border-green-100 pt-4 mt-0">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-12 text-center p-8 rounded-3xl border border-green-100"
                    style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}
                >
                    <p className="text-gray-600 font-medium mb-4">Still have questions? Our team is ready to help.</p>
                    <a
                        href="https://wa.me/919019786255"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #15803d, #22c55e)' }}
                    >
                        <MessageCircle size={18} />
                        Chat with us on WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
