import React from 'react';

const Stats = () => {
    return (
        <div className="bg-primary py-16 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <div className="text-4xl lg:text-5xl font-bold mb-2">2,000+</div>
                        <div className="text-green-200 text-lg">Documents Delivered</div>
                    </div>
                    <div className="p-4 border-t md:border-t-0 md:border-l border-white/20">
                        <div className="text-4xl lg:text-5xl font-bold mb-2">1,500+</div>
                        <div className="text-green-200 text-lg">Properties Served</div>
                    </div>
                    <div className="p-4 border-t md:border-t-0 md:border-l border-white/20">
                        <div className="text-4xl lg:text-5xl font-bold mb-2">1,500+</div>
                        <div className="text-green-200 text-lg">Trusted Customers</div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <p className="text-green-200 mb-8 uppercase tracking-wider text-sm">Trusted by residents of</p>
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-xl font-bold uppercase">Sri Mitra</span>
                        <span className="text-xl font-bold uppercase">Kolte Patil</span>
                        <span className="text-xl font-bold uppercase">Sobha</span>
                        <span className="text-xl font-bold uppercase">Brigade</span>
                        <span className="text-xl font-bold uppercase">Prestige</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
