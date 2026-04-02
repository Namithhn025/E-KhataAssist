import React from 'react';
import { X, FileText } from 'lucide-react';
import ServiceRequestForm from './ServiceRequestForm';

const ServiceRequestModal = ({ isOpen, onClose, serviceName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-white/20">
                    <div className="relative bg-white px-8 pt-10 pb-8 sm:p-10">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        <div className="sm:flex sm:items-start mb-8">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl bg-green-50 text-primary sm:mx-0 border border-green-100">
                                <FileText className="h-7 w-7" aria-hidden="true" />
                            </div>
                            <div className="mt-4 text-center sm:mt-0 sm:ml-5 sm:text-left">
                                <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2" id="modal-title">
                                    Apply for <span className="text-primary italic">{serviceName}</span>
                                </h3>
                                <p className="text-sm text-gray-500 font-medium">
                                    Enter your details and our property experts will reach out to you within 24 hours.
                                </p>
                            </div>
                        </div>

                        <div className="mt-2">
                            <ServiceRequestForm
                                serviceName={serviceName}
                                onSuccess={() => setTimeout(onClose, 2000)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestModal;
