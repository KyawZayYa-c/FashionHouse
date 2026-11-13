// backend/data/seedProducts.js
// Run with: node data/seedProducts.js
// Or import it into your main seeder.js

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')
const Product = require('../models/Product')
const Category = require('../models/Category')

dotenv.config({ path: path.join(__dirname, '..', '.env') })

// ---------- HELPERS ----------
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Convert to Mongoose Decimal128
const money = (val) => mongoose.Types.Decimal128.fromString(val.toFixed(2))

// Build images array (first image is primary)
const buildImages = (urls) =>
  urls.map((url, i) => ({
    url,
    isPrimary: i === 0,
    displayOrder: i,
  }))

// Build variants with unique SKUs
const buildVariants = (baseSku, sizes, colors, basePrice, stock) => {
  const variants = []
  sizes.forEach((size) => {
    colors.forEach((color) => {
      variants.push({
        sku: `${baseSku}-${size}-${color.toUpperCase().replace(/\s/g, '')}`,
        size,
        color,
        stock: stock[Math.floor(Math.random() * stock.length)],
        additionalPrice: money(0),
      })
    })
  })
  return variants
}

// ---------- RAW PRODUCT DATA (25 items) ----------
const rawProducts = [
  // ========== T-SHIRTS (5) ==========
  {
    productName: 'Classic Crew Neck T-Shirt',
    brand: 'Fashion House',
    category: 'T-Shirts',
    description: 'Premium 100% cotton crew neck tee. Soft, breathable, and built to last wash after wash.',
    basePrice: 25000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Gray'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
    ],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Oversized Graphic T-Shirt',
    brand: 'Urban Style',
    category: 'T-Shirts',
    description: 'Relaxed fit oversized tee with a vintage-inspired front print. Perfect for streetwear.',
    basePrice: 32000,
    sizes: ['M', 'L', 'XL'],
    colors: ['Black', 'White'],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    ],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Polo Shirt',
    brand: 'Fashion House',
    category: 'T-Shirts',
    description: 'Timeless polo shirt with ribbed collar and button placket. Smart-casual essential.',
    basePrice: 38000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Navy', 'White', 'Green'],
    images: ['https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Striped Long Sleeve Tee',
    brand: 'Coastal Wear',
    category: 'T-Shirts',
    description: 'Breton-stripe long sleeve tee in organic cotton. Effortlessly French.',
    basePrice: 35000,
    sizes: ['S', 'M', 'L'],
    colors: ['Navy/White', 'Black/White'],
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Vintage Wash T-Shirt',
    brand: 'Urban Style',
    category: 'T-Shirts',
    description: 'Garment-dyed tee with a soft, broken-in feel from day one.',
    basePrice: 28000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Burgundy', 'Charcoal'],
    images: ['https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?w=800'],
    isFeatured: false,
    status: 'active',
  },

  // ========== SNEAKERS (5) ==========
  {
    productName: 'Retro Runner Sneakers',
    brand: 'Stride',
    category: 'Sneakers',
    description: 'Classic retro running silhouette with suede overlays and cushioned midsole.',
    basePrice: 120000,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White/Gray', 'Black/White'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800',
    ],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Canvas High-Top Sneakers',
    brand: 'Stride',
    category: 'Sneakers',
    description: 'Iconic high-top canvas sneakers with rubber toe cap. A must-have classic.',
    basePrice: 85000,
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Black', 'Red', 'White'],
    images: ['https://images.unsplash.com/photo-1494496195158-c3becb4f2475?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Chunky Dad Sneakers',
    brand: 'Urban Style',
    category: 'Sneakers',
    description: 'Bold chunky sole with layered mesh and leather upper. Statement streetwear.',
    basePrice: 145000,
    sizes: ['7', '8', '9', '10', '11'],
    colors: ['White', 'Beige'],
    images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800'],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Running Performance Shoes',
    brand: 'AirMax',
    category: 'Sneakers',
    description: 'Lightweight performance runners with responsive foam and breathable knit.',
    basePrice: 165000,
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: ['Blue/Black', 'Gray/Orange'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Slip-On Canvas Shoes',
    brand: 'Stride',
    category: 'Sneakers',
    description: 'Easy slip-on canvas shoes for everyday wear. Comfort meets simplicity.',
    basePrice: 55000,
    sizes: ['6', '7', '8', '9', '10'],
    colors: ['Black', 'Navy', 'Off-White'],
    images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800'],
    isFeatured: false,
    status: 'active',
  },

  // ========== ACCESSORIES (6) ==========
  {
    productName: 'Classic Snapback Cap',
    brand: 'Fashion House',
    category: 'Accessories',
    description: 'Structured snapback cap with embroidered logo. One size fits most.',
    basePrice: 30000,
    sizes: ['One Size'],
    colors: ['Black', 'Gray', 'Navy'],
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800'],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Leather Belt',
    brand: 'Heritage',
    category: 'Accessories',
    description: 'Full-grain leather belt with brushed metal buckle. Built to last a lifetime.',
    basePrice: 45000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown', 'Black'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Retro Sunglasses',
    brand: 'Vista',
    category: 'Accessories',
    description: 'UV400-protected retro sunglasses with a lightweight frame.',
    basePrice: 55000,
    sizes: ['One Size'],
    colors: ['Black', 'Tortoise'],
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Wool Beanie',
    brand: 'Coastal Wear',
    category: 'Accessories',
    description: 'Soft merino wool beanie with folded cuff. Warm and stylish.',
    basePrice: 22000,
    sizes: ['One Size'],
    colors: ['Charcoal', 'Cream', 'Forest Green'],
    images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Minimalist Quartz Watch',
    brand: 'Heritage',
    category: 'Accessories',
    description: 'Slim quartz watch with Japanese movement and leather strap.',
    basePrice: 180000,
    sizes: ['One Size'],
    colors: ['Black/Brown', 'Silver/Black'],
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Elegant Leather Bag',
    brand: 'Heritage',
    category: 'Accessories',
    description: 'Handcrafted leather crossbody bag with adjustable strap.',
    basePrice: 195000,
    sizes: ['One Size'],
    colors: ['Tan', 'Black'],
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
    isFeatured: true,
    status: 'active',
  },

  // ========== JACKETS (4) ==========
  {
    productName: 'Denim Jacket',
    brand: 'Urban Style',
    category: 'Jackets',
    description: 'Classic denim trucker jacket in a medium wash. Timeless layering piece.',
    basePrice: 95000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Bomber Jacket',
    brand: 'AirMax',
    category: 'Jackets',
    description: 'Lightweight bomber jacket with ribbed cuffs and zip front.',
    basePrice: 130000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Olive', 'Black', 'Navy'],
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Puffer Jacket',
    brand: 'Coastal Wear',
    category: 'Jackets',
    description: 'Water-resistant puffer jacket with synthetic insulation.',
    basePrice: 175000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Red'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Leather Biker Jacket',
    brand: 'Heritage',
    category: 'Jackets',
    description: 'Premium leather biker jacket with asymmetric zip and quilted shoulders.',
    basePrice: 320000,
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    isFeatured: true,
    status: 'active',
  },

  // ========== HOODIES & SWEATERS (3) ==========
  {
    productName: 'Pullover Hoodie',
    brand: 'Fashion House',
    category: 'Hoodies',
    description: 'Heavyweight fleece hoodie with kangaroo pocket and adjustable hood.',
    basePrice: 55000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Gray', 'Navy', 'White'],
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    isFeatured: true,
    status: 'active',
  },
  {
    productName: 'Zip-Up Hoodie',
    brand: 'Urban Style',
    category: 'Hoodies',
    description: 'Full-zip hoodie in a mid-weight cotton blend. Everyday comfort.',
    basePrice: 62000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Olive'],
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Knit Crew Sweater',
    brand: 'Coastal Wear',
    category: 'Sweaters',
    description: 'Soft cable-knit crew sweater in premium wool blend.',
    basePrice: 78000,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Charcoal', 'Navy'],
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
    isFeatured: false,
    status: 'active',
  },

  // ========== PANTS & JEANS (2) ==========
  {
    productName: 'Slim Fit Jeans',
    brand: 'Heritage',
    category: 'Pants',
    description: 'Classic slim-fit jeans in dark indigo stretch denim.',
    basePrice: 85000,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Indigo', 'Black'],
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
    isFeatured: false,
    status: 'active',
  },
  {
    productName: 'Chino Trousers',
    brand: 'Fashion House',
    category: 'Pants',
    description: 'Cotton twill chino trousers. Smart-casual staple.',
    basePrice: 65000,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Beige', 'Navy', 'Olive'],
    images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800'],
    isFeatured: false,
    status: 'active',
  },
]

// ---------- MAIN SEED FUNCTION ----------
const seedProducts = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI|| 'mongodb://localhost:27017/fashion_house')
    console.log('✅ Connected.')

    // Fetch all categories into a lookup map by name
    const categories = await Category.find({})
    if (categories.length === 0) {
      console.error('❌ No categories found. Seed categories FIRST, then run this.')
      process.exit(1)
    }
    const categoryMap = {}
    categories.forEach((c) => {
      categoryMap[c.categoryName?.toLowerCase()] = c._id
    })

    console.log(`📦 Found ${categories.length} categories.`)

    // Clear existing products
    console.log('🗑️  Clearing existing products...')
    await Product.deleteMany({})
    console.log('✅ Products cleared.')

    // Build final product documents
    const productsToInsert = rawProducts.map((raw, index) => {
      const categoryId =
        categoryMap[raw.category.toLowerCase()] ||
        categoryMap[raw.category.toLowerCase().replace(/s$/, '')] ||
        categories[0]._id // fallback to first category

      const slug = slugify(`${raw.brand}-${raw.productName}-${index + 1}`)
      const baseSku = slug.substring(0, 8).toUpperCase()

      // Stock pool to randomize per variant
      const stockPool = [0, 3, 5, 8, 12, 20, 35, 50]

      return {
        categoryId,
        productName: raw.productName,
        slug,
        description: raw.description,
        brand: raw.brand,
        price: money(raw.basePrice),
        variants: buildVariants(
          baseSku,
          raw.sizes,
          raw.colors,
          raw.basePrice,
          stockPool
        ),
        images: buildImages(raw.images),
        status: raw.status || 'active',
        isFeatured: raw.isFeatured || false,
      }
    })

    // Validate: only one primary image per product
    productsToInsert.forEach((p) => {
      const primaries = p.images.filter((img) => img.isPrimary).length
      if (primaries > 1) {
        console.warn(`⚠️  ${p.productName} has multiple primary images — fixing...`)
        p.images = p.images.map((img, i) => ({ ...img, isPrimary: i === 0 }))
      }
    })

    // Insert
    console.log(`🌱 Inserting ${productsToInsert.length} products...`)
    const inserted = await Product.insertMany(productsToInsert)
    console.log(`✅ Successfully inserted ${inserted.length} products.`)

    // Summary
    console.log('\n📊 SUMMARY:')
    inserted.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.brand} ${p.productName} — ${p.variants.length} variants`)
    })

    console.log('\n🎉 Seeding complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

// Only run if executed directly (not when imported)
if (require.main === module) {
  seedProducts()
}

module.exports = seedProducts
module.exports.rawProducts = rawProducts