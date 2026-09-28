// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const path = require('path');
// const rateLimit = require('express-rate-limit');

// const authRoutes = require('./routes/authRoutes');
// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const wishlistRoutes = require('./routes/wishlistRoutes');
// const cartRoutes = require('./routes/cartRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// const {
//   notFoundHandler,
//   errorHandler,
// } = require('./middleware/errorHandler');

// const {
//   ensureSuperAdmin,
// } = require('./utils/ensureSuperAdmin');

// const app = express();

// /*
//  * IMPORTANT:
//  * Render runs the Express application behind a proxy.
//  * This allows express-rate-limit to correctly read
//  * X-Forwarded-For.
//  */
// app.set('trust proxy', 1);

// /*
//  * Security headers
//  */
// app.use(helmet());

// /*
//  * CORS
//  */
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   })
// );

// /*
//  * Body parsers
//  */
// app.use(express.json({ limit: '2mb' }));

// app.use(
//   express.urlencoded({
//     extended: true,
//   })
// );

// /*
//  * General API rate limit
//  *
//  * Auth routes can have their own stricter limits.
//  */
// app.use(
//   '/api',
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 300,
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

// /*
//  * Serve uploaded images
//  */
// app.use(
//   '/uploads',
//   express.static(
//     path.join(__dirname, '..', 'uploads')
//   )
// );

// /*
//  * Health check
//  */
// app.get('/api/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Unique Designs API is running',
//   });
// });

// /*
//  * API Routes
//  */
// app.use('/api/auth', authRoutes);

// app.use('/api/users', userRoutes);

// app.use('/api/products', productRoutes);

// app.use('/api/categories', categoryRoutes);

// app.use('/api/wishlist', wishlistRoutes);

// app.use('/api/cart', cartRoutes);

// app.use('/api/admin', adminRoutes);

// /*
//  * 404 Handler
//  */
// app.use(notFoundHandler);

// /*
//  * Global Error Handler
//  */
// app.use(errorHandler);

// /*
//  * Server Port
//  */
// const PORT = process.env.PORT || 5000;

// /*
//  * Start Server
//  */
// app.listen(PORT, async () => {
//   console.log(
//     `Unique Designs API running on port ${PORT}`
//   );

//   try {
//     await ensureSuperAdmin();
//   } catch (err) {
//     console.error(
//       'Failed to ensure Super Admin account:',
//       err.message
//     );
//   }
// });



require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');

const {
  notFoundHandler,
  errorHandler,
} = require('./middleware/errorHandler');

const {
  ensureSuperAdmin,
} = require('./utils/ensureSuperAdmin');

const app = express();

// ==========================================
// TRUST PROXY
// Required for Render / reverse proxy
// ==========================================
app.set('trust proxy', 1);

// ==========================================
// SECURITY
// Allow frontend to load uploaded images
// ==========================================
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

// ==========================================
// CORS
// ==========================================
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      'http://localhost:5173',
    credentials: true,
  })
);

// ==========================================
// BODY PARSER
// ==========================================
app.use(
  express.json({
    limit: '2mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ==========================================
// API RATE LIMIT
// ==========================================
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ==========================================
// UPLOADED IMAGES
// ==========================================
app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '..', 'uploads')
  )
);

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Unique Designs API is running',
  });
});

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/products', productRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/wishlist', wishlistRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/admin', adminRoutes);

// ==========================================
// ERROR HANDLERS
// ==========================================
app.use(notFoundHandler);

app.use(errorHandler);

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(
    `Unique Designs API running on port ${PORT}`
  );

  try {
    await ensureSuperAdmin();
  } catch (err) {
    console.error(
      'Failed to ensure Super Admin account:',
      err.message
    );
  }
});

module.exports = app;

// /*
//  * Export app
//  */
// module.exports = app;
