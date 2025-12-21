import React, { useState } from 'react';
import { X, Phone, FileText, CheckCircle } from 'lucide-react';

const ServiceRequestModal = ({ isOpen, onClose, serviceName }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Google Form Configuration
        const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdej1_c5eKMP2h138UKDXBysldAnLGO6EaE0iN574LL7bAIPQ/formResponse";
        const entryIds = {
            name: "entry.2005620554",
            email: "entry.1045781291",
            address: "entry.1065046570",
            phone: "entry.1166974658",
            comments: "entry.839337160"
        };

        // Construct form data for submission
        const formBody = new URLSearchParams();
        formBody.append(entryIds.name, formData.name);
        formBody.append(entryIds.phone, formData.phone);
        formBody.append(entryIds.comments, `Service Requested: ${serviceName}`);
        formBody.append(entryIds.email, formData.email);
        formBody.append(entryIds.address, formData.address);

        try {
            // Send data to Google Forms
            await fetch(formUrl, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formBody
            });

            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setFormData({ name: '', phone: '', email: '', address: '' });
            }, 3000);

        } catch (error) {
            console.error("Form submission error", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">

                    {isSuccess ? (
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Request Sent!</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                We have received your request for <strong>{serviceName}</strong>. Our team will contact you shortly on {formData.phone}.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            Request Service: <span className="text-primary font-bold">{serviceName}</span>
                                        </h3>
                                        <div className="mt-2 text-sm text-gray-500">
                                            Please provide your details so we can assist you better.
                                            <br />
                                            <span className="text-xs text-gray-400 mt-1 block">Data will be stored securely.</span>
                                        </div>

                                        <form id="requestForm" onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    id="phone"
                                                    required
                                                    pattern="[0-9]{10}"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    placeholder="Enter 10-digit mobile number"
                                                />
                                            </div>

                                            {/* Optional Fields */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address <span className="text-gray-400 text-xs font-normal">(Optional)</span></label>
                                                <textarea
                                                    name="address"
                                                    id="address"
                                                    rows="2"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                    placeholder="Enter your locality/address"
                                                ></textarea>
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="submit"
                                    form="requestForm"
                                    disabled={isSubmitting}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Sending...' : 'Get Call Back'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestModal;
