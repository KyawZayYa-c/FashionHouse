import React from 'react';
import { useTranslation } from 'react-i18next';

const Products = () => {
  const { t } = useTranslation();

  // --- MOCK DATA ---
  const mainProducts = [
    {
      id: 1,
      name: 'Black T-shirt',
      price: '$50.00',
      category: 'T-SHIRTS',
      rating: 5,
      isSale: true,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 2,
      name: 'Brown Cap',
      price: '$25.00',
      category: 'ACCESSORIES',
      rating: 4,
      isSale: false,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 3,
      name: 'Color Sneakers',
      price: '$50.00',
      category: 'SNEAKERS',
      rating: 4.5,
      isSale: true,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 4,
      name: 'Elegant Bag',
      price: '$50.00',
      category: 'ACCESSORIES',
      rating: 0,
      isSale: false,
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 5,
      name: 'Gray Shoes',
      price: '$50.00',
      category: 'SNEAKERS',
      rating: 0,
      isSale: false,
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 6,
      name: 'Quartz Watch',
      price: '$50.00',
      category: 'WATCHES',
      rating: 0,
      isSale: true,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    },
  ];

  const topRated = [
    { name: 'Quartz Watch', price: '$50.00', oldPrice: '$60.00', rating: 5, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { name: 'Black T-shirt', price: '$50.00', oldPrice: '$60.00', rating: 5, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { name: 'Color Sneakers', price: '$50.00', oldPrice: '$60.00', rating: 4.5, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { name: 'Snapback Cap', price: '$30.00', oldPrice: '$45.00', rating: 4, image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
    { name: 'Gray Shoes', price: '$50.00', oldPrice: null, rating: 3.5, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80' },
  ];

  // Helper to render stars
  const renderStars = (rating) => {
    return (
      <div className="flex text-[#f5a623] text-sm mb-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.floor(rating) ? 'text-[#f5a623]' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col font-sans bg-white dark:bg-gray-950 transition-colors duration-300">
      
      {/* --- PAGE HEADER --- */}
      <div className="w-full bg-[#e6e6e6] dark:bg-[#1a1a1a] py-16 flex flex-col items-center justify-center transition-colors duration-300">
        <p className="text-gray-500 text-sm mb-4">
          <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">{t('Shop.home')}</span> 
          <span className="mx-2">/</span> 
          <span className="text-gray-800 dark:text-gray-300">{t('Shop.products')}</span>
        </p>
        <h1 className="text-5xl font-serif font-black text-gray-900 dark:text-white tracking-wide">{t('Shop.products')}</h1>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-16 flex flex-col lg:flex-row gap-12">
        
        {/* --- LEFT SIDEBAR (Filters) --- */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-12">
          
          {/* Filter by Price */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">{t('Shop.filterByPrice')}</h2>
            <div className="px-2">
              {/* Custom styled range slider */}
              <input 
                type="range" 
                min="25" 
                max="60" 
                defaultValue="40"
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-gray-500"
              />
              <div className="flex justify-between mt-6 gap-4">
                <div className="flex flex-col w-1/2">
                  <input type="text" value="$25" readOnly className="border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white p-2 text-sm text-center" />
                  <span className="text-xs text-gray-500 mt-1">{t('Shop.minPrice')}</span>
                </div>
                <div className="flex flex-col w-1/2">
                  <input type="text" value="$60" readOnly className="border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white p-2 text-sm text-center" />
                  <span className="text-xs text-gray-500 mt-1 text-right">{t('Shop.maxPrice')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top rated products */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-6">{t('Shop.topRated')}</h2>
            <div className="flex flex-col gap-5">
              {topRated.map((item, index) => (
                <div key={index} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-16 h-16 bg-[#f7f7f7] dark:bg-[#222] flex items-center justify-center p-2 shrink-0 transition-colors duration-300">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#d64541] transition-colors">{item.name}</h3>
                    {renderStars(item.rating)}
                    <p className="text-sm text-gray-500">
                      {item.price} {item.oldPrice && <span className="text-gray-400 line-through text-xs ml-1">{item.oldPrice}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Banner */}
          <div className="bg-[#1a1a1a] text-white p-8 rounded-sm relative overflow-hidden group cursor-pointer">
            <div className="absolute -right-8 -top-8 w-32 h-32 border border-gray-700/50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -right-12 -top-12 w-40 h-40 border border-gray-700/30 rounded-full group-hover:scale-110 transition-transform duration-500 delay-75"></div>
            <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">New Cloth <br/> Technologies</h3>
            <p className="text-gray-400 text-sm leading-relaxed relative z-10">
              Mauris vitae ultricies leo integer malesuada. Odio tempor orci dapibus ultrices in.
            </p>
          </div>

        </aside>

        {/* --- RIGHT PRODUCT GRID --- */}
        <main className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                
                {/* Image Container */}
                <div className="relative bg-[#f7f7f7] dark:bg-gray-400 aspect-square flex items-center justify-center p-8 mb-5 overflow-hidden transition-colors duration-300">
                {product.isSale ? (
                    <span className="absolute top-4 left-4 bg-[#25cf52] rounded-sm text-white text-xs font-bold px-2 py-1 uppercase z-10">
                      Sale
                    </span>
                  ) : (
                    <span className="absolute top-4 left-4 bg-[#d64541] rounded-sm text-white text-xs font-bold px-2 py-1 uppercase z-10">
                      Out of Stock
                    </span>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{product.name}</h3>
                
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-gray-400 line-through text-xs">{product.originalPrice}</span>
                  )}
                </div>

                {renderStars(product.rating)}

                <p className="text-gray-400 text-xs uppercase tracking-wider mb-4">{product.category}</p>

                <button className="mt-auto bg-[#F2B75A] hover:bg-red-700 text-black font-semibold py-2.5 px-6 text-sm w-max transition-colors duration-300">
                {t('home.addToCart')}
                </button>
              </div>
            ))}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Products;