# Google Sheets Database Setup Guide

## 📋 Step-by-Step Instructions

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **Dentix Lab Database**
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID_HERE/edit
   ```
   The ID is the long string between `/d/` and `/edit`

### Step 2: Setup Google Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete all existing code
3. Copy the entire contents of `Code.gs` file and paste it
4. Update the `SPREADSHEET_ID` on line 18:
   ```javascript
   const SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID';
   ```
5. Click **Save** (Ctrl+S)

### Step 3: Deploy Web App

1. Click **Deploy → New deployment**
2. Click the gear icon and select **Web app**
3. Set the following:
   - **Description**: Dentix Lab API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Click **Authorize access** and allow permissions
6. **Copy the Web app URL** (looks like):
   ```
   https://script.google.com/macros/s/XXXXX/exec
   ```

### Step 4: Initialize Data

1. In Apps Script, select **initializeSheets** function from dropdown
2. Click **Run**
3. This will create all sheets with sample data

### Step 5: Configure Next.js

1. Open your `.env` file
2. Add the following line:
   ```
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
3. Replace with your actual URL

### Step 6: Restart Development Server

```bash
bun run dev
```

---

## 📊 Sheet Structure

After initialization, your Google Sheet will have these tabs:

### 1. Patients
| Column | Description |
|--------|-------------|
| id | Unique ID |
| firstName | First Name |
| lastName | Last Name |
| email | Email Address |
| phone | Phone Number |
| ... | ... |

### 2. Staff (Doctors)
| Column | Description |
|--------|-------------|
| id | Unique ID |
| firstName | First Name |
| lastName | Last Name |
| email | Email |
| specialization | Specialization |
| avatar | Photo URL |
| ... | ... |

### 3. Services
| Column | Description |
|--------|-------------|
| id | Unique ID |
| name | Service Name |
| price | Price |
| duration | Duration (minutes) |
| category | Category |
| ... | ... |

### 4. Appointments
| Column | Description |
|--------|-------------|
| id | Unique ID |
| patientId | Patient Reference |
| doctorId | Doctor Reference |
| serviceId | Service Reference |
| dateTime | Date & Time |
| status | PENDING, CONFIRMED, etc. |
| ... | ... |

### 5. Invoices
| Column | Description |
|--------|-------------|
| id | Unique ID |
| invoiceNumber | Invoice Number |
| patientId | Patient Reference |
| total | Total Amount |
| status | PENDING, PAID, etc. |
| ... | ... |

### 6. Settings
| Column | Description |
|--------|-------------|
| key | Setting Name |
| value | Setting Value |
| updatedAt | Last Updated |

### 7. Testimonials
| Column | Description |
|--------|-------------|
| id | Unique ID |
| patientName | Patient Name |
| rating | Rating (1-5) |
| comment | Review Text |
| approved | TRUE/FALSE |

---

## 🔌 API Usage

The Google Apps Script provides a REST API:

### GET All Records
```
GET https://script.google.com/macros/s/XXX/exec?table=patients
```

### GET Single Record
```
GET https://script.google.com/macros/s/XXX/exec?table=patients&id=abc123
```

### POST Create Record
```
POST https://script.google.com/macros/s/XXX/exec?table=patients
Body: { "firstName": "John", "lastName": "Doe", "email": "john@example.com" }
```

### PUT Update Record
```
PUT https://script.google.com/macros/s/XXX/exec?table=patients
Body: { "id": "abc123", "firstName": "Jane" }
```

### DELETE Record
```
DELETE https://script.google.com/macros/s/XXX/exec?table=patients&id=abc123
```

---

## ✅ Testing

After setup, test the API:

1. Open your deployed URL in browser:
   ```
   https://script.google.com/macros/s/XXX/exec?table=services
   ```
   
2. You should see JSON data with your services

3. Check Google Sheet - data should appear in the respective tabs

---

## 🔒 Security Notes

- The web app is accessible to "Anyone" with the URL
- For production, consider:
  - Adding API key validation
  - Rate limiting
  - Domain restriction

---

## ❓ Troubleshooting

### Error: "Authorization required"
- Run the script once manually in Apps Script editor
- Grant permissions when prompted

### Error: "Sheet not found"
- Run `initializeSheets()` function first

### Error: "Invalid JSON"
- Check the Apps Script deployment
- Make sure web app is deployed, not library

### Data not appearing
- Check Google Sheet ID is correct
- Verify the sheet has data
- Check Apps Script logs: View → Logs
