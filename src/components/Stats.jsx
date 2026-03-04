import React from 'react';

const Stats = () => {
    return (
        <div className="vault-gradient py-24 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="p-8 group">
                        <div className="text-5xl lg:text-7xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">2,000+</div>
                        <div className="inline-block px-4 py-1 rounded-full glass-pill text-green-300 text-sm font-bold uppercase tracking-widest">Documents Delivered</div>
                    </div>
                    <div className="p-8 md:border-l border-white/10 group">
                        <div className="text-5xl lg:text-7xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">1,500+</div>
                        <div className="inline-block px-4 py-1 rounded-full glass-pill text-green-300 text-sm font-bold uppercase tracking-widest">Properties Served</div>
                    </div>
                    <div className="p-8 md:border-l border-white/10 group">
                        <div className="text-5xl lg:text-7xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">1,500+</div>
                        <div className="inline-block px-4 py-1 rounded-full glass-pill text-green-300 text-sm font-bold uppercase tracking-widest">Trusted Customers</div>
                    </div>
                </div>

                <div className="mt-24 text-center">
                    <p className="text-white/40 mb-10 uppercase tracking-[0.3em] text-xs font-black">Trusted by residents & partners of</p>
                    <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                        {['Sri Mitra', 'Kolte Patil', 'Sobha', 'Brigade', 'Prestige'].map(name => (
                            <span key={name} className="text-2xl md:text-3xl font-black uppercase tracking-tighter hover:text-white hover:scale-110 transition-all cursor-default">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Stats;
