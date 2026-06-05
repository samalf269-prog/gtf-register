/**
 * Secure Webhook Handler (Node.js + Express + Notion SDK)
 * 
 * To run this server:
 * 1. npm install express cors dotenv @notionhq/client
 * 2. Configure NOTION_TOKEN and NOTION_DATABASE_ID in your .env file
 * 3. Run: node webhook_handler.js
 */

const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing middlewares
app.use(cors());
app.use(express.json());

// Initialize Notion Client
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// POST Endpoint to receive webhook from registration form
app.post('/notion-webhook', async (req, res) => {
  try {
    const data = req.body;
    console.log('[WEBHOOK RECEIVED] Processing student lead details:', data);

    // Verify configurations exist
    if (!process.env.NOTION_TOKEN || !DATABASE_ID) {
      console.error('[CONFIG ERROR] Missing NOTION_TOKEN or NOTION_DATABASE_ID environment variables.');
      return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Map form data fields into Notion database properties
    const properties = {
      "Name": {
        "title": [
          {
            "text": {
              "content": data.name || "Anonymous Lead"
            }
          }
        ]
      },
      "WhatsApp": {
        "phone_number": data.whatsapp || ""
      },
      "Email": {
        "email": data.email || ""
      },
      "German Level": {
        "select": {
          "name": data.german_level || "None"
        }
      },
      "Goal": {
        "select": {
          "name": data.goal || "Language"
        }
      },
      "Timeline": {
        "select": {
          "name": data.timeline || "6 months"
        }
      },
      "Budget": {
        "select": {
          "name": data.budget || "Not sure"
        }
      },
      "Source": {
        "select": {
          "name": data.source || "Other"
        }
      },
      "Lead Score": {
        "number": Number(data.lead_score) || 0
      },
      "Status": {
        "select": {
          "name": "New"
        }
      },
      "Date Submitted": {
        "date": {
          "start": data.date_submitted || new Date().toISOString()
        }
      }
    };

    // If goal is Ausbildung, add interest field details
    if (data.goal === 'Ausbildung' && data.ausbildung_field) {
      properties["Ausbildung Field"] = {
        "select": {
          "name": data.ausbildung_field
        }
      };
    }

    // Insert new page row into the Notion Database
    const response = await notion.pages.create({
      parent: {
        database_id: DATABASE_ID
      },
      properties: properties
    });

    console.log('✅ Lead successfully added to Notion! Page ID:', response.id);
    return res.status(200).json({ success: true, message: 'Lead recorded in Notion', id: response.id });

  } catch (error) {
    console.error('❌ Failed to create Notion entry:', error.message);
    return res.status(500).json({ error: 'Failed to record lead', details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Webhook handler listening on port ${PORT}...`);
  console.log(`📡 Set your frontend script WEBHOOK_URL to: http://localhost:${PORT}/notion-webhook`);
});
