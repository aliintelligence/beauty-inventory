# 💄 Beauty Inventory Tracker

A complete inventory management system built for beauty product businesses. Track products, manage orders, calculate profits, and monitor revenue - perfect for beauty entrepreneurs and small businesses.

## ✨ Features

- **Product Management**: Add, edit, and track beauty products with costs, pricing, and inventory levels
- **Order Management**: Create customer orders with optional contact information
- **Automatic Inventory Updates**: Stock levels automatically decrease when orders are placed
- **Profit Tracking**: Calculate profit margins including customs/import costs
- **Revenue Analytics**: Track sales performance and business insights
- **Low Stock Alerts**: Visual indicators for products running low
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18 or later
- Supabase account
- Vercel account (for deployment)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd beauty-inventory
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **API** to find your credentials
3. Copy your **Project URL** and **Anon Key**

### 3. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

Run the database migration to create all necessary tables:

```bash
npx supabase init
npx supabase link --project-ref your_project_ref
npx supabase db push
```

Or manually run the SQL migration file in your Supabase SQL editor:
- Copy the contents of `supabase/migrations/20250604000001_create_inventory_schema.sql`
- Paste and run in Supabase SQL Editor

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📊 Database Schema

The app includes these main tables:

- **products**: Store product information, costs, and inventory
- **orders**: Customer order information
- **order_items**: Individual items within each order
- **Views**: Pre-built analytics views for revenue and product performance

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to your main branch.

## 🎯 Usage Guide

### Adding Products

1. Navigate to **Products** → **Add Product**
2. Fill in product details:
   - Product name and description
   - Selling price
   - Product cost
   - Customs/import costs (optional)
   - Initial stock quantity

### Creating Orders

1. Go to **Orders** → **New Order**
2. Add customer information (optional)
3. Select products and quantities
4. Review and create order
5. Inventory automatically updates

### Viewing Analytics

Visit the **Analytics** page to see:
- Total revenue and profit
- Top-performing products
- Recent sales trends
- Profit margins and business insights

## 🔧 Customization

### Styling
- Colors and themes can be customized in `tailwind.config.js`
- Main brand colors are set to pink/purple theme

### Features
- Add user authentication by implementing Supabase Auth
- Extend with categories, suppliers, or other business features
- Add barcode scanning for inventory management

## 📝 Sample Data

The migration includes sample beauty products to get you started:
- Fenty Beauty Gloss Bomb
- Rare Beauty Soft Pinch Blush
- Charlotte Tilbury Flawless Filter
- And more popular beauty products

## 🐛 Troubleshooting

### Build Errors
- Ensure all environment variables are set correctly
- Check that Supabase database is accessible

### Database Issues
- Verify your Supabase project is active
- Check that all tables were created properly
- Ensure RLS policies allow data access

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for beauty entrepreneurs everywhere! 💄✨