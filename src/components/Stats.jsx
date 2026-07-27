import React, { useState, useEffect, useRef } from 'react';

const useCountUp = (target, duration = 2000, startOnVisible = true) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!startOnVisible) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStarted(true); },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [startOnVisible]);

    useEffect(() => {
        if (!started) return;
        const startTime = performance.now();
        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
            else setCount(target);
        };
        requestAnimationFrame(animate);
    }, [started, target, duration]);

    return { count, ref };
};

const formatNumber = (n) => n.toLocaleString('en-IN');

const StatCard = ({ target, label, delay = 0, border = false }) => {
    const { count, ref } = useCountUp(target, 2000 + delay);
    return (
        <div ref={ref} className={`p-8 group ${border ? 'md:border-l border-white/10' : ''}`}>
            <div className="text-6xl lg:text-8xl font-black mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                {formatNumber(count)}+
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full glass-pill text-green-300 text-xs font-black uppercase tracking-widest border border-white/10">{label}</div>
        </div>
    );
};

const Stats = () => {
    return (
        <div className="vault-gradient pt-14 pb-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 blueprint-grid opacity-[0.08] pointer-events-none"></div>
            <div className="absolute top-1/4 right-[10%] building-symbol text-white opacity-[0.03] rotate-12 scale-150 animate-float-slow"></div>
            <div className="absolute bottom-1/4 left-[10%] document-symbol text-white opacity-[0.03] -rotate-12 scale-125 animate-float"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <StatCard target={10250} label="Documents Delivered" delay={0} />
                    <StatCard target={8542} label="Properties Served" delay={200} border />
                    <StatCard target={7913} label="Trusted Customers" delay={400} border />
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
