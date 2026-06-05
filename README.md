# Gateway to Future — Student Registration Funnel

A premium, mobile-first registration page with real-time lead score calculations, webhook posting capabilities, and structured integration definitions for Fillout.com and Notion.

## File Roles

- `index.html`: Holds the registration page structure, trust badges, form, and thank you screens.
- `styles.css`: Implements the dark (#0a0a0a) & gold (#D4AF37) branding visual aesthetics.
- `script.js`: Computes the dynamic lead priority scores on field changes and POSTs payloads.
- `notion_schema.json`: Notion database properties template for mapping lead columns.
- `webhook_handler.js`: Secure Express backend endpoint that authenticates and writes leads to the Notion API.

---

## Dynamic Lead Priority Scoring Rules

The form automatically computes a `lead_score` value between `0` and `90` on submission:
- **German Level**: B1 or higher = `+20`
- **Ausbildung interest**: Field set to "Pflege" = `+15`
- **Certificates**: Goethe/Telc certificate held = `+10`
- **Timeline**: ASAP or within 3 months = `+20`
- **Budget**: Language budget set to 500€+ = `+15`
- **Source**: Referral from friend/counselor = `+10`

---

## How to Configure

### 1. Embedded Fillout Form Option
If you decide to replace the native form with an embedded Fillout form:
- Open `index.html`.
- Uncomment the `<section class="fillout-embed-wrapper">` block (lines 42–57).
- Paste your Fillout iframe embed snippet inside that block.
- Delete or comment out the `<form id="gtf-lead-form">` tag.

### 2. Native Form & Webhook Settings
If using the native form with dynamic scoring:
- Open `script.js`.
- Update `WEBHOOK_URL` (line 10) to point to your live server webhook (e.g. Make, Zapier, or your deployed `webhook_handler.js` URL).
- Open `index.html` and update the WhatsApp CTA button `href` (line 218) with your official counseling phone number.

### 3. Setting Up the Webhook & Notion Database
To run the server-side integration securely:
1. In Notion, create an integration token at [developers.notion.com](https://developers.notion.com/).
2. Create a new database named **"GTF Student Leads"** matching the properties in `notion_schema.json`. Share the database access with your integration.
3. Install dependencies in the backend:
   ```bash
   npm install express cors dotenv @notionhq/client
   ```
4. Create a `.env` file in the same directory:
   ```env
   PORT=3000
   NOTION_TOKEN=secret_your_notion_api_integration_token
   NOTION_DATABASE_ID=your_database_uuid_string
   ```
5. Run the webhook listener:
   ```bash
   node webhook_handler.js
   ```

---

## Git Deployment to GitHub Pages

Run these commands inside this directory to create your public repository and launch the registration page:

```bash
# 1. Initialize Git
git init

# 2. Add files and make initial commit
git add .
git commit -m "feat: GTF student registration funnel v1"

# 3. Rename branch to main
git branch -M main

# 4. Link your remote GitHub repo
git remote add origin https://github.com/samalf269-prog/gtf-register.git

# 5. Push to GitHub
git push -u origin main
```

### Enable Pages
1. Go to your repo settings on GitHub: **`https://github.com/samalf269-prog/gtf-register/settings/pages`**
2. Set **Source** -> **Deploy from a branch**.
3. Set **Branch** -> **`main`** and folder **`/ (root)`**, then click **Save**.
4. Your page will go live within a minute at: **[https://samalf269-prog.github.io/gtf-register/](https://samalf269-prog.github.io/gtf-register/)**
