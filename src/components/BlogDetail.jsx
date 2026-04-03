import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, Calendar, User, 
    Share2, Facebook, Twitter, Linkedin,
    ChevronDown, ChevronUp, BellRing, Copy, Check
} from 'lucide-react';
import { blogData } from '../data/blogData';

const BlogDetail = () => {
    const { blogId } = useParams();
    const [openFaq, setOpenFaq] = useState(0);
    const [copied, setCopied] = useState(false);

    // Find the blog from data
    const blog = blogData.find(b => b.id === blogId);

    // SEO: Update page title and meta description
    useEffect(() => {
        if (blog) {
            document.title = `${blog.title} | E-KhataAssist Blog`;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute("content", blog.excerpt);
            }
        }
    }, [blog]);

    if (!blog) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
                    <Link to="/blogs" className="text-primary hover:underline">Return to Knowledge Base</Link>
                </div>
            </div>
        );
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Get related blogs (excluding the current one)
    const relatedBlogs = blogData.filter(b => b.id !== blog.id).slice(0, 3);

    return (
        <div className="bg-white min-h-screen pt-8 pb-20">
            {/* Top Bar / Breadcrumb */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <Link 
                    to="/blogs"
                    className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Knowledge Base
                </Link>
            </div>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Meta Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                            {blog.category}
                        </span>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} /> {blog.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User size={14} /> {blog.author}
                            </span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-10">
                        {blog.title}
                    </h1>
                    <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 border border-gray-100">
                        <img 
                            src={blog.image} 
                            alt={blog.title} 
                            className="w-full h-[300px] md:h-[500px] object-cover"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
                    {blog.content.map((section, index) => {
                        if (section.type === 'p') {
                            return <p key={index} className="text-xl mb-6">{section.text}</p>;
                        }
                        if (section.type === 'h2') {
                            return <h2 key={index} className="text-3xl font-bold text-gray-900 mt-12 mb-6">{section.text}</h2>;
                        }
                        if (section.type === 'h3') {
                            return <h3 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">{section.text}</h3>;
                        }
                        if (section.type === 'list') {
                            return (
                                <ul key={index} className="space-y-4 my-8">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex gap-4 items-start">
                                            <div className="bg-primary/10 rounded-full p-1 mt-1">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                            </div>
                                            <span className="text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            );
                        }
                        if (section.type === 'table') {
                            return (
                                <div key={index} className="my-10 overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {section.headers.map((header, i) => (
                                                    <th key={i} className="p-4 font-bold text-gray-900 border-r border-gray-100 last:border-r-0">{header}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.rows.map((row, i) => (
                                                <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                                                    {row.map((cell, j) => (
                                                        <td key={j} className="p-4 text-gray-600 border-r border-gray-100 last:border-r-0">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* FAQ Section (If available) */}
                {blog.faqs && blog.faqs.length > 0 && (
                    <div className="mt-20 border-t border-gray-100 pt-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-10">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {blog.faqs.map((faq, index) => (
                                <div 
                                    key={index}
                                    className={`border rounded-2xl transition-all duration-300 ${openFaq === index ? 'border-primary bg-green-50/30' : 'border-gray-200 hover:border-green-100'}`}
                                >
                                    <button 
                                        className="w-full flex items-center justify-between p-6 text-left"
                                        onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                                    >
                                        <span className={`text-lg font-bold ${openFaq === index ? 'text-primary' : 'text-gray-900'}`}>{faq.question}</span>
                                        {openFaq === index ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </button>
                                    {openFaq === index && (
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Share Section */}
                <div className="mt-20 flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50 border border-gray-100 rounded-3xl gap-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary text-white p-3 rounded-2xl shadow-lg">
                            <Share2 size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-lg">Share this Article</p>
                            <p className="text-gray-400 text-sm">Spread the knowledge with your circle.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleCopyLink}
                            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm flex items-center gap-2"
                            title="Copy link to clipboard"
                        >
                            {copied ? <Check size={20} className="text-primary" /> : <Copy size={20} />}
                            {copied && <span className="text-xs font-bold text-primary">Copied!</span>}
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] transition-all shadow-sm">
                            <Facebook size={20} />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-all shadow-sm">
                            <Twitter size={20} />
                        </button>
                        <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#0A66C2] hover:border-[#0A66C2] transition-all shadow-sm">
                            <Linkedin size={20} />
                        </button>
                    </div>
                </div>

                {/* Service CTA */}
                <div className="mt-16 bg-primary rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                        <div className="bg-white/20 inline-block px-3 py-1 rounded-lg text-sm font-bold mb-4 uppercase tracking-tighter">
                            Need Expert Help?
                        </div>
                        <h3 className="text-3xl font-bold mb-4">Let our team handle Your property paperwork.</h3>
                        <p className="text-green-100 text-lg opacity-90 max-w-lg">
                            Professional legal assistance for E-Khata, Transfers, and property documentation in Bengaluru.
                        </p>
                    </div>
                    <a 
                        href="/#services"
                        className="relative z-10 bg-white text-primary px-8 py-4 rounded-xl font-extrabold shadow-xl hover:bg-green-50 transition-colors whitespace-nowrap flex items-center gap-2"
                    >
                        <BellRing size={20} /> Get Started Now
                    </a>
                </div>

            </article>

            {/* Other Blogs Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-40">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-12 border-l-4 border-primary pl-4">Other Articles You Might Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedBlogs.map((relatedBlog) => (
                        <Link 
                            key={relatedBlog.id} 
                            to={`/blogs/${relatedBlog.id}`}
                            className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col cursor-pointer transform hover:translate-y-[-4px] transition-all duration-300"
                        >
                            <div className="relative overflow-hidden h-40">
                                <img 
                                    src={relatedBlog.image} 
                                    alt={relatedBlog.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 left-3">
                                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm border border-gray-100">
                                        {relatedBlog.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                    {relatedBlog.title}
                                </h3>
                                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {relatedBlog.date}</span>
                                    <span className="text-primary font-bold">Read →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
