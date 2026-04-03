import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import About from './components/About';
import FAQ from './components/FAQ';
import ContactFooter from './components/Footer';
import ServiceDetail from './components/ServiceDetail';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';

function App() {
  const location = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Default SEO reset for landing page
  useEffect(() => {
    if (location.pathname === '/') {
      document.title = "E-Khata Assist | Property Documentation Simplified";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", "E-Khata Assist provides professional, hassle-free property documentation services in Bengaluru, including E-Khata, Khata Transfer, MODT Closure, and legal consultation.");
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Header />
      
      <main>
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={
            <>
              <Hero />
              <Stats />
              <Services />
              <About />
              <FAQ />

              <section className="py-20 bg-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl font-bold text-primary mb-12">Why People Trust Us</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100 flex flex-col h-full">
                      <div className="text-primary text-3xl mb-4">★ ★ ★ ★ ★</div>
                      <p className="text-gray-600 italic mb-6 flex-grow">"I literally struggled with other agencies like NoBroker and Vault — they didn’t even reply properly. Finally, I got my E-Khata done smoothly thanks to Ajay and his team. Truly relieved and grateful.”</p>
                      <div className="font-bold text-gray-900 border-t pt-4">- Robert</div>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100 flex flex-col h-full">
                      <div className="text-primary text-3xl mb-4">★ ★ ★ ★ ★</div>
                      <p className="text-gray-600 italic mb-6 flex-grow">"The founder is a young and very intelligent professional with deep knowledge in proptech. My E-Khata was completed within just a few days. Impressive speed and expertise.”</p>
                      <div className="font-bold text-gray-900 border-t pt-4">- Munikenchapa</div>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100 flex flex-col h-full">
                      <div className="text-primary text-3xl mb-4">★ ★ ★ ★ ★</div>
                      <p className="text-gray-600 italic mb-6 flex-grow">"They handle everything with complete transparency. No advance payment at all. Trust me, they are the best people to rely on for property-related services.”</p>
                      <div className="font-bold text-gray-900 border-t pt-4">- Fazal</div>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-green-100 flex flex-col h-full">
                      <div className="text-primary text-3xl mb-4">★ ★ ★ ★ ★</div>
                      <p className="text-gray-600 italic mb-6 flex-grow">"Don’t wait or think twice. You can confidently choose them. They are the best when it comes to delivering services within the promised time period.”</p>
                      <div className="font-bold text-gray-900 border-t pt-4">- Jayalaxmi</div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          } />

          {/* Service Detail Route */}
          <Route path="/services/:serviceId" element={<ServiceDetail />} />

          {/* Blogs Listing Route */}
          <Route path="/blogs" element={<BlogList />} />

          {/* Blog Detail Route */}
          <Route path="/blogs/:blogId" element={<BlogDetail />} />
        </Routes>
      </main>
      
      <ContactFooter />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/919019786255"
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
