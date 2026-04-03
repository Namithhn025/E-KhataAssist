import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, BookOpen } from 'lucide-react';
import { blogData } from '../data/blogData';

const BlogList = () => {
    const featuredBlog = blogData[0];
    const latestBlogs = blogData.slice(1);

    // SEO: Updated title for the Knowledge Base page
    React.useEffect(() => {
        document.title = "Property Documentation Knowledge Base | E-KhataAssist Blogs";
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute("content", "Explore expert guides on E-Khata, Khata Transfer, MODT Closure, and more property services in Bengaluru.");
        }
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4">
                        <BookOpen size={14} />
                        <span>Knowledge Base</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Stay Informed with E-KhataAssist Blogs
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        Expert insights, legal guides, and the latest updates on property documentation in Karnataka.
                    </p>
                </div>

                {/* Featured Blog */}
                {featuredBlog && (
                    <Link 
                        to={`/blogs/${featuredBlog.id}`}
                        className="group block relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-16 cursor-pointer transform hover:translate-y-[-4px] transition-all duration-300"
                    >
                        <div className="flex flex-col lg:flex-row">
                            <div className="lg:w-1/2 overflow-hidden">
                                <img 
                                    src={featuredBlog.image} 
                                    alt={featuredBlog.title} 
                                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        {featuredBlog.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                        <Calendar size={14} />
                                        <span>{featuredBlog.date}</span>
                                    </div>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 group-hover:text-primary transition-colors">
                                    {featuredBlog.title}
                                </h2>
                                <p className="text-gray-600 text-lg mb-8 leading-relaxed line-clamp-3">
                                    {featuredBlog.excerpt}
                                </p>
                                <div className="flex items-center text-primary font-bold gap-2 group-hover:gap-3 transition-all underline decoration-2 underline-offset-4">
                                    Read Full Article <ArrowRight size={18} />
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Latest Blogs Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-primary pl-4">
                        Latest Blogs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {latestBlogs.map((blog) => (
                            <Link 
                                key={blog.id} 
                                to={`/blogs/${blog.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col cursor-pointer transform hover:translate-y-[-4px] transition-all duration-300"
                            >
                                <div className="relative overflow-hidden h-48">
                                    <img 
                                        src={blog.image} 
                                        alt={blog.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm border border-gray-100">
                                            {blog.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-4">
                                        <Calendar size={12} />
                                        <span>{blog.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {blog.excerpt}
                                    </p>
                                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <User size={12} /> {blog.author}
                                        </span>
                                        <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogList;
