import React from 'react';

const Stats = () => {
    return (
        <div className="vault-gradient pt-14 pb-10 text-white relative overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 blueprint-grid opacity-[0.08] pointer-events-none"></div>
            <div className="absolute top-1/4 right-[10%] building-symbol text-white opacity-[0.03] rotate-12 scale-150 animate-float-slow"></div>
            <div className="absolute bottom-1/4 left-[10%] document-symbol text-white opacity-[0.03] -rotate-12 scale-125 animate-float"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="p-8 group">
                        <div className="text-6xl lg:text-8xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">7,000+</div>
                        <div className="inline-block px-4 py-1.5 rounded-full glass-pill text-green-300 text-xs font-black uppercase tracking-widest border border-white/10">Documents Delivered</div>
                    </div>
                    <div className="p-8 md:border-l border-white/10 group">
                        <div className="text-6xl lg:text-8xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">6,500+</div>
                        <div className="inline-block px-4 py-1.5 rounded-full glass-pill text-green-300 text-xs font-black uppercase tracking-widest border border-white/10">Properties Served</div>
                    </div>
                    <div className="p-8 md:border-l border-white/10 group">
                        <div className="text-6xl lg:text-8xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">6,500+</div>
                        <div className="inline-block px-4 py-1.5 rounded-full glass-pill text-green-300 text-xs font-black uppercase tracking-widest border border-white/10">Trusted Customers</div>
                    </div>
                </div>

                <div className="mt-12 text-center pb-6">
                    <p className="text-white/40 mb-6 uppercase tracking-[0.3em] text-xs font-black">Trusted by residents & partners of</p>
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
