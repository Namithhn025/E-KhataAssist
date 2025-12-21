import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import ContactFooter from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Services />

        {/* Testimonials or "Why Us" could go here */}
        <section className="py-20 bg-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary mb-12">Why People Trust Us</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="text-[#FBBF24] text-4xl mb-4">★ ★ ★ ★ ★</div>
                <p className="text-gray-600 italic mb-6">"Got my Khata transfer done in record time. Didn't have to visit any office. Amazing service!"</p>
                <div className="font-bold text-gray-900">- Rajesh Kumar</div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="text-[#FBBF24] text-4xl mb-4">★ ★ ★ ★ ★</div>
                <p className="text-gray-600 italic mb-6">"Very professional team. They handled my property legal verification thoroughly."</p>
                <div className="font-bold text-gray-900">- Priya Sharma</div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="text-[#FBBF24] text-4xl mb-4">★ ★ ★ ★ ★</div>
                <p className="text-gray-600 italic mb-6">"The E-Khata process was explained clearly and executed perfectly. Highly recommend."</p>
                <div className="font-bold text-gray-900">- Anand Gowda</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <ContactFooter />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/918088917577"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-colors z-50 flex items-center gap-2 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">Chat with us</span>
      </a>
    </div>
  );
}

export default App;
