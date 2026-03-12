# 🧹 Bathroom Cleaning Tracker

A web-based bathroom cleaning tracker for monitoring cleaning compliance with Ontario Regulation 480/24. Employees scan a QR code, complete a checklist, and submit records that are automatically saved to Google Sheets.

## Features

✅ **3 Bathroom Rooms** - Separate tracking for Mens, Womens, and Accessible washrooms  
✅ **Comprehensive Checklist** - 7-8 cleaning tasks per bathroom  
✅ **QR Code Access** - Simple scan-and-fill workflow  
✅ **Employee Tracking** - Records initials and timestamp  
✅ **Google Sheets Integration** - All data stored in Google Sheets  
✅ **Dashboard** - View and filter cleaning records  
✅ **Mobile Responsive** - Works great on phones and tablets  
✅ **Netlify Hosted** - Simple, free hosting  

## Quick Start

### 1. Prerequisites
- GitHub account
- Netlify account (free)
- Google account (for Google Sheets API)

### 2. Set Up Google Sheets & API

Visit the **Settings** page in the app for detailed instructions on:
- Creating a Google Sheet
- Enabling Google Sheets API
- Creating a Service Account
- Generating credentials

### 3. Deploy to Netlify

1. **Push to GitHub**: Commit this project to a GitHub repository
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/bathroom-tracker.git
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select your repository
   - Click "Deploy site"

3. **Add Environment Variables**:
   - In Netlify dashboard, go to Settings → Build & deploy → Environment
   - Add these variables (from your Google Service Account JSON):
     ```
     GOOGLE_SHEETS_ID=your_spreadsheet_id
     GOOGLE_SERVICE_ACCOUNT_EMAIL=your@serviceaccount.email
     GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
     GOOGLE_PROJECT_ID=your-project-id
     ```

4. **Trigger a Deploy**:
   - Push a small change to GitHub or redeploy manually in Netlify
   - Your site will be live at `https://your-site-name.netlify.app`

### 4. Create QR Codes

Once deployed:
1. Generate QR codes at [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Create QR codes for each bathroom:
   - Mens: `https://your-site.netlify.app/form.html?bathroom=mens`
   - Womens: `https://your-site.netlify.app/form.html?bathroom=womens`
   - Accessible: `https://your-site.netlify.app/form.html?bathroom=accessible`
3. Print and laminate the codes
4. Post them in each bathroom

## Local Development

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm run dev
```

Visit `http://localhost:8888` in your browser.

### Testing
1. Open [http://localhost:8888/form.html?bathroom=mens](http://localhost:8888/form.html?bathroom=mens)
2. Fill in the form with test data
3. Check your Google Sheet for the new record

## File Structure

```
bathroom-tracker/
├── index.html              # Main home page with bathroom selection
├── form.html               # Cleaning checklist form
├── dashboard.html          # View all cleaning records
├── settings.html           # Setup guide and instructions
├── package.json            # Node dependencies
├── netlify.toml            # Netlify configuration
├── netlify/
│   └── functions/
│       ├── submit-cleaning.js     # Submit finalized check to Google Sheets
│       └── get-cleaning-records.js # Retrieve records from Google Sheets
└── README.md               # This file
```

## Data Structure

Records saved to Google Sheets include:
- **Timestamp**: Date and time of cleaning
- **Bathroom**: Which bathroom was cleaned
- **Initials**: Employee initials
- **Tasks**: Comma-separated list of completed tasks

## Compliance

This tracker helps maintain compliance with **Ontario Regulation 480/24** which requires regular bathroom cleaning and documentation.

## Troubleshooting

**"Google Sheets not configured"**
- Verify all environment variables are set correctly in Netlify
- Check that GOOGLE_PRIVATE_KEY includes the full key with `\n` line breaks
- Ensure the service account has Editor access to your spreadsheet

**Submissions not appearing**
- Check browser console (F12) for error messages
- Verify Google Sheet headers match: Timestamp | Bathroom | Initials | Tasks
- Confirm service account email has been shared with the Google Sheet

**QR Code not working**
- Test the URL directly in browser first
- Ensure you're using the correct Netlify URL (not localhost)
- Try regenerating the QR code

## Support

For detailed setup instructions, visit the **Settings** page within the app.

---

**Ready to get started?** Visit your deployed site and click "Settings" for step-by-step Google Sheets setup guide!
