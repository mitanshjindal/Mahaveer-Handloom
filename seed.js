require('dotenv').config();
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }
});
const Product = mongoose.model('Product', productSchema);

const productsData = [
  {
    "name": "Premium Cotton Double Bedsheet",
    "category": "Bedsheets",
    "price": "₹899",
    "image": "assets/bedsheet.png",
    "description": "Luxurious 100% cotton double bedsheet with elegant traditional prints. Includes 2 pillow covers."
  },
  {
    "name": "Warm Winter Blanket",
    "category": "Blankets",
    "price": "₹1499",
    "image": "assets/blanket.png",
    "description": "Ultra-soft and warm winter blanket. Durable, premium quality handloom fabric."
  },
  {
    "name": "Traditional Handloom Curtains",
    "category": "Curtains",
    "price": "₹699",
    "image": "assets/curtain.png",
    "description": "Set of 2 beautiful handloom curtains to elevate your living room decor."
  },
  {
    "name": "Durable Floor Mat (Chatai)",
    "category": "Mats",
    "price": "₹450",
    "image": "assets/mat.png",
    "description": "Traditional Indian woven floor mat. Highly durable, easy to clean, and perfect for daily use."
  }
];

async function seedDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // Disable deleting so we don't accidentally wipe stuff if ran twice, just checking if empty
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany(productsData);
            console.log('Database seeded securely!');
        } else {
            console.log('Database already has items. Skipping seed.');
        }
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        mongoose.connection.close();
    }
}

seedDB();
