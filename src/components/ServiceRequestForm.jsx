import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const ServiceRequestForm = ({ serviceName, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdej1_c5eKMP2h138UKDXBysldAnLGO6EaE0iN574LL7bAIPQ/formResponse";
        const entryIds = {
            name: "entry.2005620554",
            email: "entry.1045781291",
            address: "entry.1065046570",
            phone: "entry.1166974658",
            comments: "entry.839337160"
        };

        const formBody = new URLSearchParams();
        formBody.append(entryIds.name, formData.name);
        formBody.append(entryIds.phone, formData.phone);
        formBody.append(entryIds.comments, `Service Requested: ${serviceName}`);
        formBody.append(entryIds.email, formData.email);
        formBody.append(entryIds.address, formData.address);

        try {
            await fetch(formUrl, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formBody
            });

            setIsSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setIsSuccess(false);
                setFormData({ name: '', phone: '', email: '', address: '' });
            }, 5000);

        } catch (error) {
            console.error("Form submission error", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Request Received!</h3>
                <p className="text-gray-600 font-medium">
                    Our experts will contact you within 24 hours.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Full Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email <span className="text-gray-400 font-normal">(Optional)</span></label>
                <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-medium"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-black py-4 rounded-xl hover:bg-green-800 transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>Submit Request</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                )}
            </button>
            <p className="text-[10px] text-center text-gray-400 font-medium px-4">
                By submitting, you agree to be contacted by our property legal experts.
            </p>
        </form>
    );
};

export default ServiceRequestForm;
