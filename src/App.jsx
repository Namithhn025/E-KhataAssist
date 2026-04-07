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

import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import WorkerDashboard from './components/WorkerDashboard';

function App() {
  const location = useLocation();
  const isCRM = location.pathname.startsWith('/admin') || location.pathname.startsWith('/worker') || location.pathname === '/login';

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Intersection Observer for scroll-reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealedElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealedElements.forEach((el) => observer.observe(el));

    return () => {
      revealedElements.forEach((el) => observer.unobserve(el));
    };
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
    <AuthProvider>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        {!isCRM && <Header />}
        
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/worker" element={<WorkerDashboard />} />
            
            {/* Landing Page Route */}
            <Route path="/" element={
            <>
              <Hero />
              <Stats />
              <Services />
              <About />
              <FAQ />

              <section className="py-16 bg-[#f0fdf4] relative reveal">
                {/* Background Decorations */}
                <div className="absolute inset-0 blueprint-grid opacity-[0.15] pointer-events-none"></div>
                <div className="absolute top-10 left-10 stamp-float opacity-[0.06] -z-0"></div>
                <div className="absolute bottom-10 right-10 document-symbol text-primary opacity-[0.05] -z-0 rotate-12 scale-150"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-primary text-[10px] font-black mb-6 uppercase tracking-widest rounded-full">
                    <span>Trusted by 1000+ Landowners</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-16 tracking-tight">
                    Why Citizens <span className="text-primary italic">Trust Us</span>
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-green-100 flex flex-col h-full vault-card-hover hover-glow relative group">
                      <div className="absolute top-4 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11.5L11.5 11.5L11.5 8V4H21.5V17C21.5 19.2091 19.7091 21 17.5 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V11.5L0.5 11.5L0.5 8V4H10.5V17C10.5 19.2091 8.70914 21 6.5 21H3.017Z"/></svg>
                      </div>
                      <div className="text-primary text-2xl mb-6 flex gap-1">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-grow">"I literally struggled with other agencies like NoBroker and Vault — they didn’t even reply properly. Finally, I got my E-Khata done smoothly thanks to Ajay and his team. Truly relieved and grateful.”</p>
                      <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">R</div>
                        <div className="text-left">
                          <div className="font-black text-gray-900">Robert</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verified Client</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-green-100 flex flex-col h-full vault-card-hover hover-glow relative group">
                      <div className="absolute top-4 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11.5L11.5 11.5L11.5 8V4H21.5V17C21.5 19.2091 19.7091 21 17.5 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V11.5L0.5 11.5L0.5 8V4H10.5V17C10.5 19.2091 8.70914 21 6.5 21H3.017Z"/></svg>
                      </div>
                      <div className="text-primary text-2xl mb-6 flex gap-1">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-grow">"The founder is a young and very intelligent professional with deep knowledge in proptech. My E-Khata was completed within just a few days. Impressive speed and expertise.”</p>
                      <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">M</div>
                        <div className="text-left">
                          <div className="font-black text-gray-900">Munikenchapa</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verified Client</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-green-100 flex flex-col h-full vault-card-hover hover-glow relative group">
                      <div className="absolute top-4 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11.5L11.5 11.5L11.5 8V4H21.5V17C21.5 19.2091 19.7091 21 17.5 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V11.5L0.5 11.5L0.5 8V4H10.5V17C10.5 19.2091 8.70914 21 6.5 21H3.017Z"/></svg>
                      </div>
                      <div className="text-primary text-2xl mb-6 flex gap-1">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-grow">"They handle everything with complete transparency. No advance payment at all. Trust me, they are the best people to rely on for property-related services.”</p>
                      <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">F</div>
                        <div className="text-left">
                          <div className="font-black text-gray-900">Fazal</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verified Client</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-sm border border-green-100 flex flex-col h-full vault-card-hover hover-glow relative group">
                      <div className="absolute top-4 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11.5L11.5 11.5L11.5 8V4H21.5V17C21.5 19.2091 19.7091 21 17.5 21H14.017ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V11.5L0.5 11.5L0.5 8V4H10.5V17C10.5 19.2091 8.70914 21 6.5 21H3.017Z"/></svg>
                      </div>
                      <div className="text-primary text-2xl mb-6 flex gap-1">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                      <p className="text-gray-600 font-medium leading-relaxed mb-8 flex-grow">"Don’t wait or think twice. You can confidently choose them. They are the best when it comes to delivering services within the promised time period.”</p>
                      <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">J</div>
                        <div className="text-left">
                          <div className="font-black text-gray-900">Jayalaxmi</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verified Client</div>
                        </div>
                      </div>
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
      
      {!isCRM && <ContactFooter />}

      {/* Floating WhatsApp Button */}
      {!isCRM && (
        <a
          href="https://wa.me/919019786255"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-colors z-50 flex items-center gap-2 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">Chat with us</span>
        </a>
      )}
        </div>
      </AuthProvider>
    );
  }

export default App;
