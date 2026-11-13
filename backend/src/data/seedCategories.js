// backend/src/data/seedCategories.js
// Run with: node src/data/seedCategories.js

const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('path')
const Category = require('../models/Category')

// Load .env from backend root (2 levels up from src/data/)
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const categories = [
  {
    categoryName: 'T-Shirts',
    slug: 't-shirts',
    description: 'Casual, graphic, and premium cotton tees',
    isActive: true,
  },
  {
    categoryName: 'Sneakers',
    slug: 'sneakers',
    description: 'Running, casual, and street sneakers',
    isActive: true,
  },
  {
    categoryName: 'Accessories',
    slug: 'accessories',
    description: 'Caps, bags, belts, watches, and sunglasses',
    isActive: true,
  },
  {
    categoryName: 'Jackets',
    slug: 'jackets',
    description: 'Denim, leather, bomber, and puffer jackets',
    isActive: true,
  },
  {
    categoryName: 'Hoodies',
    slug: 'hoodies',
    description: 'Pullover and zip-up hoodies',
    isActive: true,
  },
  {
    categoryName: 'Sweaters',
    slug: 'sweaters',
    description: 'Knit crew neck and cable sweaters',
    isActive: true,
  },
  {
    categoryName: 'Pants',
    slug: 'pants',
    description: 'Jeans, chinos, and trousers',
    isActive: true,
  },
]

const seedCategories = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_house'
    )
    console.log('✅ Connected.')

    // Clear existing categories
    console.log('🗑️  Clearing existing categories...')
    await Category.deleteMany({})
    console.log('✅ Categories cleared.')

    // Insert new ones
    console.log(`🌱 Inserting ${categories.length} categories...`)
    const inserted = await Category.insertMany(categories)
    console.log(`✅ Successfully inserted ${inserted.length} categories.`)

    console.log('\n📊 CATEGORIES:')
    inserted.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.categoryName}  (slug: ${c.slug})`)
    })

    console.log('\n🎉 Category seeding complete!')
    console.log('👉 Next: run "npm run seed:products"')
    process.exit(0)
  } catch (err) {
    console.error('❌ Category seeding failed:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

seedCategories()