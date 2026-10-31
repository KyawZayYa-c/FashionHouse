import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  // This have to  move
  const products = [
    {
      id: 1,
      name: 'Snapback Cap',
      price: '30,000 Kyats',
      category: 'ACCESSORIES',
      isSale: true,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: 'Gray Shoes',
      price: '50,000 Kyats',
      category: 'SNEAKERS',
      isSale: false,
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: 'Black T-shirt',
      price: '25,000 Kyats',
      category: 'T-SHIRTS',
      isSale: true,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      name: 'Retro Sunglasses',
      price: '$55.00',
      category: 'ACCESSORIES',
      isSale: true,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
  ];


  return (
    <div className="w-full flex flex-col font-sans">
      
      {/* --- HERO SECTION --- */}
      <div className="w-full min-h-[calc(100vh-80px)] bg-[#e6e6e6] flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-0">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-serif font-black text-gray-900 leading-[1.1] mb-6">
            Brand New <br />
            Collection
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-lg mb-8 leading-relaxed">
            {t('home.subtitle') || "Mauris vitae ultricies leo integer malesuada tempor orci dapibus ultrices diam in arcu cursus euismod purus viverra accumsan."}
          </p>
          <div className="flex flex-wrap items-center gap-6 mb-10 text-sm font-medium text-gray-800">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Top Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>High Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span>Quick Delivery</span>
            </div>
          </div>
          <div>
            <button className="bg-[#F2B75A] hover:bg-red-700 rounded-sm text-dark font-semibold py-3 px-8 tracking-wider uppercase text-sm transition-colors duration-300">
              Explore Shop
            </button>
          </div>
        </div>
        <div className="flex-1 relative flex items-center justify-center h-[500px] lg:h-auto">
          <img 
            src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Model wearing a thick white knit sweater" 
            className="w-full h-full object-cover object-top mix-blend-multiply"
          />
        </div>
      </div>

      {/* --- DARK FEATURES BAR --- */}
      <div className="w-full bg-[#111111] text-white py-16 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center">
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15l2 2 4-4" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">Secure Payment</h3>
            <p className="text-gray-400 text-sm">100% secure payment</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10.5v3m0-3a.75.75 0 100-1.5.75.75 0 000 1.5z" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">30 Days Return</h3>
            <p className="text-gray-400 text-sm">If goods have problems</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">24/7 Support</h3>
            <p className="text-gray-400 text-sm">Dedicated support</p>
          </div>
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.5a2.5 2.5 0 00-2.5-2.5h-11" /></svg>
            <h3 className="text-xl font-bold font-serif mb-2">Quick Delivery</h3>
            <p className="text-gray-400 text-sm">For all order from Meikitla</p>
          </div>
        </div>
      </div>

      {/* --- NEW ARRIVALS SECTION --- */}
      <div className="w-full bg-white py-20 px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wide">Check out latest products</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">New Arrivals</h2>
            </div>
            <button className="mt-6 md:mt-0 border border-gray-900 text-gray-900 px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-colors duration-300">
              View All
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group flex flex-col">
                
                {/* Image Container */}
                <div className="relative bg-[#f7f7f7] aspect-square flex items-center justify-center p-8 mb-6 overflow-hidden">
                  {product.isSale && (
                    <span className="absolute top-4 left-4 bg-[#25cf52] rounded-sm text-white text-xs font-bold px-2 py-1 uppercase z-10">
                      Sale
                    </span>
                  )}
                  {product.isSale || (
                    <span className="absolute top-4 left-4 bg-[#d64541] rounded-sm text-white text-xs font-bold px-2 py-1 uppercase z-10">
                      Out of Stock
                    </span>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Info */}
                <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-600 font-medium">{product.price}</span>
                  
                </div>



                {/* Category */}
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">{product.category}</p>

                {/* Add to Cart Button */}
                <button className="mt-auto bg-[#d64541] rounded-md hover:bg-red-700 text-white font-semibold py-3 px-6 text-sm w-max transition-colors duration-300">
                  Add to cart
                </button>
              </div>
            ))}
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default Home;