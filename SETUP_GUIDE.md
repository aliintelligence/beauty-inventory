# 🚀 AI Recommendations Setup Guide

## Quick Start (Tables Already Exist)

Since you're getting the "policy already exists" error, your tables are already set up! Here's how to start using the system:

### 1. Test Your Database Connection

```bash
# Run the test script
node scripts/test-database.js
```

You should see:
```
✅ PASS Products table
✅ PASS Supplier products table
✅ PASS Recommendations table
✅ PASS Recommendation details view
✅ PASS Product sales summary
```

### 2. Start Using the System

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Access the recommendations**:
   - Go to http://localhost:3000
   - Click the **top-right corner**
   - Click **"AI Rec"** button when it appears

3. **Generate your first recommendations**:
   - Click **"Generate New"** button
   - Wait for the AI to analyze your products and find recommendations

## Configuration Options

### Use Mock Data (Default - Safe for Testing)

Your `.env.local` should have:
```env
USE_REAL_SCRAPERS=false
```

This will:
- Generate realistic test data
- No risk of being blocked
- Instant results
- Perfect for testing the system

### Enable Real Scrapers (Production)

Update `.env.local`:
```env
USE_REAL_SCRAPERS=true
SCRAPER_RATE_LIMIT_MS=5000
SCRAPER_MAX_RETRIES=3
```

This will:
- Actually scrape Alibaba, Temu, and SHEIN
- Get real product data and prices
- May take longer (rate limiting)
- Could be blocked by sites (use proxies in production)

## Testing the Scrapers

### Test Mock Scrapers
```bash
curl -X POST http://localhost:3000/api/recommendations/test-scrapers \
  -H "Content-Type: application/json" \
  -d '{"useRealScrapers": false}'
```

### Test Real Scrapers
```bash
curl -X POST http://localhost:3000/api/recommendations/test-scrapers \
  -H "Content-Type: application/json" \
  -d '{"useRealScrapers": true}'
```

## Quick API Reference

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/api/recommendations` | GET | Get existing recommendations |
| `/api/recommendations/generate` | POST | Generate new recommendations |
| `/api/recommendations/test` | GET | Test database connection |
| `/api/recommendations/test-scrapers` | GET/POST | Test scraper functionality |
| `/api/recommendations/stats` | GET | Get system statistics |

## Troubleshooting

### "Policy already exists" error
- This is fine! Tables are already created
- Just start using the system

### No products showing
- Make sure you have products in your inventory
- Add some products through the admin panel first
- Then generate recommendations

### Scrapers not working
- Start with `USE_REAL_SCRAPERS=false`
- Check console logs for errors
- Verify your internet connection

### Recommendations not generating
1. Check you have products with sales data
2. Run `node scripts/test-database.js` to verify connection
3. Check browser console for errors

## Production Deployment

1. **Set environment variables in Vercel**:
   ```
   USE_REAL_SCRAPERS=true
   SCRAPER_RATE_LIMIT_MS=10000
   SCRAPER_MAX_RETRIES=5
   ```

2. **Consider using a proxy service**:
   - [ScraperAPI](https://www.scraperapi.com/)
   - [Bright Data](https://brightdata.com/)
   - Add proxy credentials to environment variables

3. **Monitor usage**:
   - Check Vercel Functions logs
   - Monitor Supabase usage
   - Adjust rate limits as needed

## Daily Automation

The system automatically runs daily at 9 AM to:
- Clean old recommendations (30+ days)
- Generate fresh recommendations
- Send email notifications (if configured)

This is configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-recommendations",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

**Need help?** Check the console logs or create an issue on GitHub!