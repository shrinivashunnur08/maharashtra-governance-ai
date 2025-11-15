# Maharashtra AI Governance Platform - Setup Guide

## Quick Start

This is a modern web application built with vanilla JavaScript, Supabase, and Google Gemini AI. Follow these steps to get it running:

### 1. Prerequisites

- A Supabase account (free tier works great)
- Google Gemini API key (free at ai.google.dev)
- Any modern web browser
- Python 3.9+ (for data population script)

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (takes ~2 minutes)
3. Go to Project Settings > API
4. Copy your:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - Anon/Public key (looks like: `eyJhbGc...`)

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Database Setup

The database schema is automatically created when you run migrations in Supabase.

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project
2. Navigate to SQL Editor
3. The tables should already be created via the MCP tool
4. Verify by checking Database > Tables

**Option B: Manual Setup (if needed)**

If tables are not created, run the migration SQL from `MIGRATION.md`

### 5. Populate Sample Data

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Run the data population script:

```bash
python populate_supabase_data.py
```

This will create:
- 50 citizen service requests
- 30 infrastructure assets
- 40 health surveillance records

### 6. Configure the Web App

Update `index.html` to include your Supabase credentials:

Add these meta tags in the `<head>` section:

```html
<meta name="supabase-url" content="YOUR_SUPABASE_URL">
<meta name="supabase-key" content="YOUR_SUPABASE_ANON_KEY">
```

Or modify `app.js` directly around line 10:

```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 7. Run the Application

**Option A: Simple Python Server**

```bash
python -m http.server 8000
```

Then open: http://localhost:8000

**Option B: Using npm**

```bash
npm run dev
```

Then open: http://localhost:8000

**Option C: Deploy to Production**

Deploy to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop the project folder
- **GitHub Pages**: Push to GitHub and enable Pages
- **Cloudflare Pages**: Connect your GitHub repo

### 8. Using the Streamlit Version

If you prefer the Streamlit version:

```bash
streamlit run app.py
```

Note: The Streamlit version still uses BigQuery. For the modern web UI, use the HTML version.

## Features Overview

### Dashboard Page
- Real-time KPI cards showing total requests, open cases, critical alerts
- Critical alerts section highlighting urgent issues
- Interactive charts (requests by type, geographic distribution)
- Recent requests table with filtering

### Analytics Page
- AI-powered complaint analysis using Google Gemini
- 7-day demand forecasting
- Request prioritization engine
- Detailed prediction results

### Citizen Portal
- Submit new complaints with full form validation
- Track existing requests by ID
- Get real-time status updates
- Receive automated confirmations

### Transparency Page
- Download anonymized datasets (CSV format)
- View impact metrics and resolution statistics
- Access compliance and security information
- See data-driven policy changes

## Security Notes

1. **Row Level Security (RLS)** is enabled on all tables
2. **Personal data** is hashed/anonymized automatically
3. **Public read access** is granted for transparency
4. **API keys** should never be committed to Git

## Troubleshooting

### Database Connection Errors

- Verify your Supabase URL and key are correct
- Check if your Supabase project is active (not paused)
- Ensure RLS policies allow public read access

### No Data Showing

- Run the data population script: `python populate_supabase_data.py`
- Check Supabase Dashboard > Table Editor to verify data exists
- Open browser console (F12) to see any JavaScript errors

### Gemini AI Not Working

- Verify your GEMINI_API_KEY is valid
- Check API quota at ai.google.dev
- The app will fall back to rule-based predictions if AI fails

### Charts Not Rendering

- Ensure Chart.js CDN is loading (check browser console)
- Verify data format is correct
- Try hard refresh (Ctrl+Shift+R)

## Project Structure

```
project/
├── index.html              # Main HTML file with all pages
├── style.css               # Modern CSS with animations
├── app.js                  # JavaScript application logic
├── supabase_helpers.py     # Python helpers for Supabase
├── populate_supabase_data.py  # Data population script
├── app.py                  # Streamlit version (legacy)
├── utils_helpers.py        # Utility functions
├── package.json            # NPM configuration
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

## Next Steps

1. Customize the UI colors in `style.css` (CSS variables at top)
2. Add more data using the Citizen Portal submission form
3. Test the AI analysis features
4. Deploy to production hosting
5. Set up custom domain

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase documentation: supabase.com/docs
- Check Google Gemini docs: ai.google.dev/docs

## License

MIT License - See LICENSE file for details
