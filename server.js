require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_API_KEY
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mahaveer_handloom',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected via Atlas'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }
}, { timestamps: true });
const Product = mongoose.model('Product', productSchema);

// API: Get all products
app.get('/api/products', async (req, res) => {
  try {
    let query = {};
    if (req.query.category && req.query.category !== 'All') {
        query.category = req.query.category;
    }
    
    let sortQuery = { createdAt: -1 }; // default newest
    if (req.query.sort === 'newest') sortQuery.createdAt = -1;
    else if (req.query.sort === 'oldest') sortQuery.createdAt = 1;
    else if (req.query.sort === 'relevance') sortQuery = {}; // Natural insertion order
    
    let dbQuery = Product.find(query).sort(sortQuery);
    
    if (req.query.limit) {
         dbQuery = dbQuery.limit(parseInt(req.query.limit));
    }
    
    const products = await dbQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Auth Middleware
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'mahaveer-secret-key-123';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
  
  next();
};

// API: Admin Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USER || 'admin';
  const validPass = process.env.ADMIN_PASS || 'mahaveer';
  
  if (username === validUser && password === validPass) {
      res.json({ message: 'Login successful', token: ADMIN_TOKEN });
  } else {
      res.status(401).json({ message: 'Invalid username or password' });
  }
});

// API: Create new product & Upload Image
app.post('/api/products', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else {
       // Fallback logic for seeding strings directly
       imageUrl = req.body.image;
    }

    if (!imageUrl) {
        return res.status(400).json({ message: 'Image is required' });
    }

    const newProduct = new Product({
      name,
      category,
      price,
      description,
      image: imageUrl
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// API: Update product (Text fields only)
app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    
    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { name, category, price, description },
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// API: Delete product
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
    }
    
    // Note: To fully clean up, we should ideally delete the image from Cloudinary here
    // using cloudinary.uploader.destroy(). Keeping it simple for now based on plan.
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

// Only redirect if trying to access original `/admin`
app.get('/admin', (req, res) => {
  res.redirect('/admin_dashboard.html');
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
