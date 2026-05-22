# PCT Systems Technical Internals
## SMS Studio, Email Marketing, Farm Requests & Assessments

**Version:** 1.0  
**Date:** March 2026  
**Purpose:** Complete technical breakdown for Vercel migration

---

## Table of Contents

1. [SMS Studio System](#1-sms-studio-system)
2. [Email Marketing System](#2-email-marketing-system)
3. [Farm Request System](#3-farm-request-system)
4. [Assessment System](#4-assessment-system)
5. [Shared Infrastructure](#5-shared-infrastructure)

---

# 1. SMS Studio System

## Overview

The SMS Studio sends MMS/SMS messages to sales reps via Twilio. It consists of a PHP admin panel and a Python Flask API on Render.com.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL (PHP)                           │
│              /vcard-new/admin/social-media-sms-v2.php               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────────┐   │
│  │ Upload Images │───▶│ Save to /sent │───▶│ Build API Payload │   │
│  └───────────────┘    └───────────────┘    └─────────┬─────────┘   │
│                                                      │              │
│  ┌───────────────────────────────────────────────────▼────────────┐ │
│  │              CURL POST → Render.com API                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     RENDER.COM API (Python Flask)                   │
│               https://main-website-files.onrender.com               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────────┐   │
│  │ Parse Payload │───▶│ Query MySQL   │───▶│ Send via Twilio   │   │
│  │               │    │ for SMS codes │    │                   │   │
│  └───────────────┘    └───────────────┘    └───────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │   TWILIO API    │
                          │ Sends MMS/SMS   │
                          └─────────────────┘
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Admin Panel | `/vcard-new/admin/social-media-sms-v2.php` | Main UI |
| Flask API | `/vcard-new/social-media-sms/render-deploy/app.py` | Render.com API |
| Uploaded Images | `/vcard-new/social-media-sms/sent/` | Image storage |
| Message History | `/vcard-new/social-media-sms/logs/message_history.json` | Campaign log |
| Settings | `/vcard-new/social-media-sms/.env` | Preview mode config |

## Variables & Configuration

### PHP Admin Panel Variables

```php
// Base URLs
define('RENDER_API_URL', 'https://main-website-files.onrender.com');
define('IMAGE_BASE_URL', 'https://pct.com/vcard-new/social-media-sms/sent/');

// Directory paths
$sms_dir = dirname(__DIR__) . '/social-media-sms';
$sent_dir = $sms_dir . '/sent';
$logs_dir = $sms_dir . '/logs';
$env_file = $sms_dir . '/.env';
$message_history_file = $logs_dir . '/message_history.json';

// SMS Codes (dynamically loaded from MySQL)
$sms_codes = []; // Populated from employees table: ['C-1' => 'John Doe', ...]
```

### Python Flask API Variables (Environment)

```python
# Twilio Configuration
TWILIO_ACCOUNT_SID = 'AC[REDACTED - rotated, see secure credential store]'
TWILIO_AUTH_TOKEN = '[redacted]'
TWILIO_FROM_NUMBER = '+18186965791'

# MySQL Database (GoDaddy)
DB_HOST = '132.148.215.120'
DB_PORT = '3306'
DB_USER = 'pctcursor1'
DB_PASSWORD = '[redacted]'
DB_NAME = 'pct_vcard'

# Preview Mode
PREVIEW_MODE = 'true'  # or 'false'
TEST_PHONE_NUMBER = '+18186965791'
```

## Data Flow: Sending an MMS

### Step 1: Admin Uploads Images

```php
// PHP receives multipart form upload
$_FILES['images'] = [
    'name' => ['C-1_post.jpg', 'C-2_post.jpg'],
    'tmp_name' => ['/tmp/phpXXXX', '/tmp/phpYYYY'],
    'size' => [245000, 312000],
    'type' => ['image/jpeg', 'image/jpeg']
];

// Saved with timestamp to /sent/ directory
$unique = 'C-1_post_1709312456_0.jpg';
$dest = '/vcard-new/social-media-sms/sent/' . $unique;
move_uploaded_file($tmp, $dest);

// Build public URL
$url = 'https://pct.com/vcard-new/social-media-sms/sent/C-1_post_1709312456_0.jpg';
```

### Step 2: PHP Sends to Render API

```php
$api_data = [
    'images' => [
        ['url' => 'https://pct.com/vcard-new/social-media-sms/sent/C-1_1709312456_0.jpg'],
        ['url' => 'https://pct.com/vcard-new/social-media-sms/sent/C-2_1709312456_1.jpg']
    ],
    'message' => "Here's your custom social media post! 🎉",
    'preview_mode' => true,     // From .env file
    'test_phone' => '+18186965791',
    'send_to_all' => false      // true for Calendar sends
];

$ch = curl_init('https://main-website-files.onrender.com/api/send-batch');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($api_data));
```

### Step 3: Flask API Processes Request

```python
@app.route('/api/send-batch', methods=['POST'])
def send_batch():
    data = request.json
    images = data.get('images', [])
    message = data.get('message', 'Here\'s your custom post!')
    send_to_all = data.get('send_to_all', False)
    
    # Get sales reps from MySQL
    reps = get_sales_reps()  # Returns list of dicts with phone, sms_code, name
    
    if send_to_all:
        # Calendar mode: send first image to ALL reps
        for rep in reps:
            send_sms(rep['phone'], f"Hi {rep['first_name']}! {message}", images[0]['url'])
    else:
        # Normal mode: parse SMS code from filename
        for image in images:
            sms_code = extract_sms_code_from_filename(image['url'])  # "C-1" from "C-1_post.jpg"
            rep = get_employee_by_sms_code(sms_code, reps)
            send_sms(rep['phone'], f"Hi {rep['first_name']}! {message}", image['url'])
```

### Step 4: Twilio Sends Message

```python
def send_sms(to_number, message, media_url=None):
    # In preview mode, redirect to test phone
    if PREVIEW_MODE:
        to_number = TEST_PHONE_NUMBER
    
    message_params = {
        'from_': TWILIO_FROM_NUMBER,  # +18186965791
        'to': to_number,               # +19495551234
        'body': message
    }
    
    if media_url:
        message_params['media_url'] = [media_url]  # MMS attachment
    
    twilio_client.messages.create(**message_params)
```

## SMS Code Routing Logic

```python
def extract_sms_code_from_filename(url):
    """
    Extract SMS code from filename patterns:
    - C-1.jpg     → C-1
    - C-28.jpg    → C-28
    - C1_promo.jpg → C1 (legacy)
    """
    filename = os.path.basename(url)  # "C-28_1709312456_0.jpg"
    name_without_ext = os.path.splitext(filename)[0]  # "C-28_1709312456_0"
    
    # Match C-{number} pattern
    match = re.match(r'^(C-\d+)(?:_.*)?$', name_without_ext, re.IGNORECASE)
    if match:
        return match.group(1).upper()  # "C-28"
    
    return None

def get_employee_by_sms_code(sms_code, reps):
    """Find employee by SMS code (normalizes C-28 vs C28)"""
    normalized = sms_code.upper().replace('-', '')  # "C28"
    
    for rep in reps:
        if rep['sms_code'].upper().replace('-', '') == normalized:
            return rep
    return None
```

## Message History Storage

```json
// /vcard-new/social-media-sms/logs/message_history.json
[
    {
        "id": "mms_65f3a1b2c4d5e",
        "type": "mms",
        "timestamp": "2026-03-02 14:30:45",
        "message": "Here's your custom social media post!",
        "images": ["C-1_1709312456_0.jpg", "C-2_1709312456_1.jpg"],
        "recipient_count": 31,
        "success_count": 31,
        "fail_count": 0,
        "recipients": [
            {
                "name": "JOHN DOE",
                "phone": "+19495551234",
                "sms_code": "C-1",
                "status": "sent",
                "error": ""
            }
        ],
        "status": "success",
        "preview_mode": false
    }
]
```

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check, rep count |
| `/api/send-batch` | POST | Send MMS batch to reps |
| `/api/send-single` | POST | Send single SMS |
| `/api/send-text-batch` | POST | Send text-only batch |
| `/api/sales-reps` | GET | List all sales reps |

---

# 2. Email Marketing System

## Overview

Automated email marketing using Mailchimp API. Generates personalized templates for each sales rep and creates scheduled campaigns.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL (PHP)                              │
│              /vcard-new/admin/email-marketing-v2.php                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│  │ TinyMCE Editor  │───▶│ Save Template   │───▶│ exec() Python  │  │
│  │ (HTML editing)  │    │ master_template │    │ Scripts        │  │
│  └─────────────────┘    └─────────────────┘    └───────┬────────┘  │
│                                                        │           │
└────────────────────────────────────────────────────────┼───────────┘
                                                         │
                                                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PYTHON SCRIPTS                                  │
│             /vcard-new/master-email-marketing/core-system/          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  campaign_manager.py                                                │
│       │                                                             │
│       ├──▶ template_generator.py                                   │
│       │         │                                                   │
│       │         └──▶ Read master_template.html                     │
│       │         └──▶ Read sales_reps_data.json                     │
│       │         └──▶ Replace {{PLACEHOLDERS}}                      │
│       │         └──▶ Generate 21 personalized HTMLs                │
│       │                                                             │
│       └──▶ mailchimp_manager.py                                    │
│                 │                                                   │
│                 └──▶ Upload templates to Mailchimp                 │
│                 └──▶ Create campaigns                              │
│                 └──▶ Link to audiences                             │
│                 └──▶ Schedule sends                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  MAILCHIMP API  │
                          │ Sends Emails    │
                          └─────────────────┘
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Admin Panel | `/vcard-new/admin/email-marketing-v2.php` | Main UI |
| Master Template | `/vcard-new/master-email-marketing/core-system/master_template.html` | Email HTML |
| Sales Rep Data | `/vcard-new/master-email-marketing/core-system/sales_reps_data.json` | Rep info |
| Campaign Manager | `/vcard-new/master-email-marketing/core-system/campaign_manager.py` | Orchestrator |
| Template Generator | `/vcard-new/master-email-marketing/core-system/template_generator.py` | Personalization |
| Mailchimp Manager | `/vcard-new/master-email-marketing/core-system/mailchimp_manager.py` | API integration |
| API Key | `/vcard-new/master-email-marketing/api-key` | Mailchimp API key |
| Template Library | `/vcard-new/master-email-marketing/template-library/` | Saved templates |

## Variables & Configuration

### Sales Rep Data Structure

```json
// /vcard-new/master-email-marketing/core-system/sales_reps_data.json
{
    "sales_reps": [
        {
            "id": "simon_wu",
            "name": "SIMON WU",
            "phone": "(626) 589-8822",
            "email": "SWU@PCT.COM",
            "logo_url": "https://mcusercontent.com/xxx/simon-logo.png",
            "audience_name": "abc1234567",     // Mailchimp audience ID
            "template_file": "GL-SimonWu.html",
            "region": "GL"                      // GL = Greater LA, OC = Orange County
        },
        {
            "id": "tmg_team",
            "name": "TMG TEAM",
            "logo_url": "https://mcusercontent.com/xxx/tmg-primary.png",
            "logos": [                          // Multi-logo support
                "https://mcusercontent.com/xxx/tmg-logo1.png",
                "https://mcusercontent.com/xxx/tmg-logo2.png"
            ],
            "audience_name": "def7890123",
            "region": "OC"
        }
    ]
}
```

### Personalization Placeholders

```html
<!-- In master_template.html -->
<h1>Hello from {{SALES_REP_NAME}}</h1>
<p>Contact me: {{SALES_REP_PHONE}}</p>
<p>Email: {{SALES_REP_EMAIL}}</p>
<img src="{{SALES_REP_LOGO_1}}" alt="Logo">

<!-- Multi-logo (optional, renders empty if not present) -->
{{SALES_REP_LOGO_2_IMG}}
{{SALES_REP_LOGO_3_IMG}}
```

### Template Generation Process

```python
# template_generator.py
def generate_templates(master_template, sales_reps, output_dir):
    template_content = open(master_template).read()
    
    for rep in sales_reps:
        personalized = template_content
        
        # Core replacements
        personalized = personalized.replace('{{SALES_REP_NAME}}', rep['name'])
        personalized = personalized.replace('{{SALES_REP_PHONE}}', rep['phone'])
        personalized = personalized.replace('{{SALES_REP_EMAIL}}', rep['email'])
        personalized = personalized.replace('{{SALES_REP_LOGO_1}}', rep['logo_url'])
        
        # Multi-logo support
        if 'logos' in rep and len(rep['logos']) > 1:
            personalized = personalized.replace('{{SALES_REP_LOGO_2_IMG}}', 
                f'<img src="{rep["logos"][1]}" width="150">')
        else:
            personalized = personalized.replace('{{SALES_REP_LOGO_2_IMG}}', '')
        
        # Save personalized template
        output_file = f"{output_dir}/{rep['region']}-{rep['id']}.html"
        open(output_file, 'w').write(personalized)
```

## Campaign Creation Flow

```python
# campaign_manager.py
def create_campaign(campaign_name, subject_line, reps='all', delay_minutes=30):
    # 1. Load data
    master_template = load_template()
    sales_reps = load_sales_reps()
    
    # 2. Filter reps if specific one selected
    if reps != 'all':
        sales_reps = [r for r in sales_reps if r['id'] == reps]
    
    # 3. Generate personalized templates
    template_generator.generate_templates(master_template, sales_reps, output_dir)
    
    # 4. For each rep: upload, create campaign, schedule
    for rep in sales_reps:
        # Upload template to Mailchimp
        template_id = mailchimp.upload_template(
            name=f"{campaign_name}-{rep['id']}",
            html=get_personalized_html(rep)
        )
        
        # Create campaign linked to rep's audience
        campaign_id = mailchimp.create_campaign(
            audience_id=rep['audience_name'],
            template_id=template_id,
            subject=subject_line,
            from_name='Pacific Coast Title'
        )
        
        # Schedule send
        send_time = datetime.now() + timedelta(minutes=delay_minutes)
        mailchimp.schedule_campaign(campaign_id, send_time)
```

## Campaign Storage

```
/vcard-new/master-email-marketing/campaigns/
└── holiday-2025/
    ├── generated_templates/
    │   ├── GL-simon_wu.html
    │   ├── GL-john_smith.html
    │   └── OC-jane_doe.html
    ├── campaign_files/
    │   └── generated_campaigns.csv
    ├── reports/
    │   └── campaign_report_20251224_143215.txt
    └── backups/
        └── master_template_backup.html
```

---

# 3. Farm Request System

## Overview

Mobile-first lead collection form for property list requests. Stores in MySQL, sends email notification to assigned sales rep.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PUBLIC FORM (HTML/JS)                           │
│                 /vcard-new/farm-request/index.html                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User fills form → JavaScript validates → POST to api.php          │
│                                                                     │
│  URL Parameters: ?rep=C-28&rep_name=John+Doe                       │
│  (Used for attribution tracking)                                    │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API HANDLER (PHP)                            │
│                 /vcard-new/farm-request/api.php                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Validate JSON input                                             │
│  2. Look up rep email by SMS code (employees table)                │
│  3. Save to farm_requests table                                     │
│  4. Send email notification to rep                                  │
│  5. Return success response                                         │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │ MySQL Database  │           │ Email (mail())  │
          │ farm_requests   │           │ To: rep email   │
          └─────────────────┘           └─────────────────┘
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Public Form | `/vcard-new/farm-request/index.html` | User-facing form |
| API Handler | `/vcard-new/farm-request/api.php` | Backend processing |
| DB Migration | `/vcard-new/database/migrations/create_farm_requests_table.sql` | Table schema |

## Form Data Structure

### URL Parameters (Rep Attribution)

```javascript
// Captured from URL: /farm-request/?rep=C-28&rep_name=John+Doe
const urlParams = new URLSearchParams(window.location.search);
const repId = urlParams.get('rep');      // "C-28"
const repName = urlParams.get('rep_name'); // "John Doe"
```

### JavaScript Payload Builder

```javascript
function buildPayload() {
    return {
        list_type: 'OUT_OF_STATE',           // Radio selection
        city_area: 'Irvine',                  // Text input
        property_address: '123 Main St',      // Conditional input
        radius: 'quarter_mile',               // Conditional radio
        list_size: '100_250',                 // Radio selection
        output_formats: ['pdf', 'csv'],       // Checkbox array
        contact: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '(949) 555-1234'           // Optional
        },
        notes: 'Focus on 3+ bedrooms',        // Conditional textarea
        source: {
            channel: 'sms',
            rep_name: repName,                // From URL param
            rep_id: repId                     // From URL param (C-28)
        },
        meta: {
            user_agent: navigator.userAgent,
            submitted_at: '2026-03-02T14:30:00Z'
        }
    };
}
```

### List Type Values

| Value | Display Label |
|-------|---------------|
| `OUT_OF_STATE` | Out-of-State Owners |
| `ABSENTEE_OWNER` | Absentee Owners (CA) |
| `EMPTY_NESTER` | Long-time Owners (20+ years) |
| `NEXT_SELLER` | Likely Upcoming Sellers |
| `CENTROID` | Homes Near a Property |
| `WALKING_FARM` | Walking Distance List |
| `SURNAME_FARM` | Surname/Cultural Targeting |
| `CUSTOM_FARMS` | Custom List Request |

## PHP API Processing

```php
// api.php - Main processing flow

// 1. Receive JSON
$data = json_decode(file_get_contents('php://input'), true);

// 2. Validate required fields
$requiredFields = ['list_type', 'city_area', 'list_size', 'contact'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        return error("Missing: $field");
    }
}

// 3. Look up rep info by SMS code
if (!empty($data['source']['rep_id'])) {
    $stmt = $db->prepare("
        SELECT first_name, last_name, email 
        FROM employees 
        WHERE (sms_code = :rep_id OR slug = :rep_id) 
        AND active = 1
    ");
    $stmt->execute(['rep_id' => $data['source']['rep_id']]);
    $rep = $stmt->fetch();
    
    $repEmail = $rep['email'];
    $repName = $rep['first_name'] . ' ' . $rep['last_name'];
}

// 4. Save to database
$stmt = $db->prepare("
    INSERT INTO farm_requests (
        list_type, city_area, property_address, radius, list_size,
        output_formats, notes, contact_name, contact_email, contact_phone,
        rep_id, rep_name, rep_email, source_channel, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

// 5. Send email notification
sendNotificationEmail($data, $repEmail, $repName);
```

## Database Schema

```sql
CREATE TABLE farm_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Request details
    list_type VARCHAR(50) NOT NULL,           -- 'OUT_OF_STATE', 'CENTROID', etc.
    city_area VARCHAR(255) NOT NULL,
    property_address VARCHAR(255),             -- For CENTROID/WALKING_FARM
    radius VARCHAR(20),                        -- 'quarter_mile', 'half_mile'
    list_size VARCHAR(20) NOT NULL,            -- '100_250', '250_500', 'best_match'
    output_formats JSON,                       -- ['pdf', 'csv', 'mailing_labels']
    notes TEXT,
    
    -- Contact info
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    
    -- Rep attribution
    rep_id VARCHAR(20),                        -- 'C-28' (SMS code)
    rep_name VARCHAR(255),
    rep_email VARCHAR(255),
    
    -- Metadata
    source_channel VARCHAR(50) DEFAULT 'sms',  -- 'sms', 'email', 'direct'
    user_agent TEXT,
    notification_sent TINYINT(1) DEFAULT 0,
    status ENUM('pending','processing','completed','cancelled') DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_rep_id (rep_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);
```

---

# 4. Assessment System

## Overview

Tool competency self-assessment for clients. Multi-step wizard form captures responses, stores in MySQL, notifies assigned sales rep.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PUBLIC FORM (HTML/JS)                           │
│                  /vcard-new/assessment/index.html                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Step 1: Title Profile questions (5)                               │
│  Step 2: Title Toolbox questions (6)                               │
│  Step 3: Pacific Agent One questions (5)                           │
│  Step 4: PCT Smart Direct questions (5)                            │
│  Step 5: PCT Website questions (4)                                 │
│  Step 6: Trainings questions (4)                                   │
│  Step 7: Sales Dashboard questions (4)                             │
│  Step 8: Respondent info (name, email)                             │
│                                                                     │
│  URL: /assessment/?rep=C-28                                        │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API HANDLER (PHP)                            │
│                  /vcard-new/assessment/api.php                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Parse JSON payload                                              │
│  2. Calculate capability score (% yes answers)                     │
│  3. Calculate avg confidence score (1-5 ratings)                   │
│  4. Insert into assessments table (68 columns)                     │
│  5. Look up rep email, send notification                           │
│  6. Return scores                                                   │
│                                                                     │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │ MySQL Database  │           │ Email (PHPMailer)│
          │ assessments     │           │ To: rep email   │
          └─────────────────┘           └─────────────────┘
```

## Form Data Structure

### JavaScript Payload

```javascript
const payload = {
    respondentName: 'Jane Smith',
    respondentEmail: 'jane@example.com',
    repCode: 'C-28',                    // From URL ?rep=C-28
    repName: 'John Doe',                // Looked up from repCode
    userAgent: navigator.userAgent,
    
    // Yes/No responses for each tool (33 total questions)
    responses: {
        'title-profile': {
            q1: true,   // "I know what Title Profile is"
            q2: false,  // "I have access to Title Profile"
            q3: true,
            q4: true,
            q5: false
        },
        'title-toolbox': {
            q1: true, q2: true, q3: false, q4: true, q5: true, q6: false
        },
        'pacific-agent-one': {
            q1: false, q2: false, q3: true, q4: true, q5: true
        },
        'pct-smart-direct': {
            q1: true, q2: true, q3: true, q4: false, q5: true
        },
        'pct-website': {
            q1: true, q2: true, q3: true, q4: true
        },
        'trainings': {
            q1: true, q2: false, q3: true, q4: true
        },
        'sales-dashboard': {
            q1: true, q2: true, q3: false, q4: true
        }
    },
    
    // Confidence ratings (1-5) for each tool category
    confidenceRatings: {
        'title-profile': {
            awareness: 4,      // "How aware are you of this tool?"
            access: 3,         // "Do you have access?"
            setup: 2,          // "Is it set up for your use?"
            usage: 3,          // "How often do you use it?"
            needTraining: 5    // "Do you need training?"
        },
        'title-toolbox': { awareness: 5, access: 4, setup: 4, usage: 3, needTraining: 2 },
        // ... same structure for all tools
    }
};
```

## PHP Score Calculation

```php
// Tool configuration: prefix → column naming in DB
$tools = [
    'title-profile' => ['prefix' => 'tp', 'questions' => 5],
    'title-toolbox' => ['prefix' => 'ttb', 'questions' => 6],
    'pacific-agent-one' => ['prefix' => 'pao', 'questions' => 5],
    'pct-smart-direct' => ['prefix' => 'psd', 'questions' => 5],
    'pct-website' => ['prefix' => 'pw', 'questions' => 4],
    'trainings' => ['prefix' => 'tr', 'questions' => 4],
    'sales-dashboard' => ['prefix' => 'sd', 'questions' => 4]
];

// Count yes answers
$yesCount = 0;
$totalQuestions = 33;

foreach ($tools as $toolKey => $config) {
    $toolResponses = $responses[$toolKey] ?? [];
    for ($i = 1; $i <= $config['questions']; $i++) {
        if ($toolResponses["q{$i}"] === true) {
            $yesCount++;
        }
    }
}

// Calculate scores
$capabilityScore = ($yesCount / $totalQuestions) * 100;  // 0-100%
$avgConfidence = $totalConfidence / $confidenceCount;     // 1-5 scale
```

## Database Schema

```sql
CREATE TABLE assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Respondent info
    respondent_name VARCHAR(255) NOT NULL,
    respondent_email VARCHAR(255) NOT NULL,
    rep_id VARCHAR(20),                    -- 'C-28'
    rep_name VARCHAR(255),
    user_agent TEXT,
    
    -- Title Profile (5 questions + 5 confidence)
    tp_q1 TINYINT(1), tp_q2 TINYINT(1), tp_q3 TINYINT(1), tp_q4 TINYINT(1), tp_q5 TINYINT(1),
    tp_awareness TINYINT, tp_access TINYINT, tp_setup TINYINT, tp_usage TINYINT, tp_need_training TINYINT,
    
    -- Title Toolbox (6 questions + 5 confidence)
    ttb_q1 TINYINT(1), ttb_q2 TINYINT(1), ttb_q3 TINYINT(1), ttb_q4 TINYINT(1), ttb_q5 TINYINT(1), ttb_q6 TINYINT(1),
    ttb_awareness TINYINT, ttb_access TINYINT, ttb_setup TINYINT, ttb_usage TINYINT, ttb_need_training TINYINT,
    
    -- Pacific Agent One (5 questions + 5 confidence)
    pao_q1 TINYINT(1), pao_q2 TINYINT(1), pao_q3 TINYINT(1), pao_q4 TINYINT(1), pao_q5 TINYINT(1),
    pao_awareness TINYINT, pao_access TINYINT, pao_setup TINYINT, pao_usage TINYINT, pao_need_training TINYINT,
    
    -- PCT Smart Direct (5 questions + 5 confidence)
    psd_q1 TINYINT(1), psd_q2 TINYINT(1), psd_q3 TINYINT(1), psd_q4 TINYINT(1), psd_q5 TINYINT(1),
    psd_awareness TINYINT, psd_access TINYINT, psd_setup TINYINT, psd_usage TINYINT, psd_need_training TINYINT,
    
    -- PCT Website (4 questions + 5 confidence)
    pw_q1 TINYINT(1), pw_q2 TINYINT(1), pw_q3 TINYINT(1), pw_q4 TINYINT(1),
    pw_awareness TINYINT, pw_access TINYINT, pw_setup TINYINT, pw_usage TINYINT, pw_need_training TINYINT,
    
    -- Trainings (4 questions + 5 confidence)
    tr_q1 TINYINT(1), tr_q2 TINYINT(1), tr_q3 TINYINT(1), tr_q4 TINYINT(1),
    tr_awareness TINYINT, tr_access TINYINT, tr_setup TINYINT, tr_usage TINYINT, tr_need_training TINYINT,
    
    -- Sales Dashboard (4 questions + 5 confidence)
    sd_q1 TINYINT(1), sd_q2 TINYINT(1), sd_q3 TINYINT(1), sd_q4 TINYINT(1),
    sd_awareness TINYINT, sd_access TINYINT, sd_setup TINYINT, sd_usage TINYINT, sd_need_training TINYINT,
    
    -- Calculated scores
    capability_score DECIMAL(5,2),         -- 0.00 to 100.00
    avg_confidence_score DECIMAL(3,2),     -- 1.00 to 5.00
    
    -- Timestamp
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rep_id (rep_id),
    INDEX idx_submitted (submitted_at)
);
```

---

# 5. Shared Infrastructure

## MySQL Database Connection

All systems use the same database configuration:

```php
// /vcard-new/config/database_mysql.php
$db_config = [
    'host' => 'localhost',              // 'localhost' on GoDaddy, '132.148.215.120' external
    'port' => '3306',
    'database' => 'pct_vcard',
    'username' => 'pctcursor1',
    'password' => 'AlphaOmega637#',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]
];
```

## Employee/Rep Lookup Pattern

```php
// Common pattern for looking up rep by SMS code
function getRepBySmsCode($sms_code) {
    global $db_config;
    $pdo = new PDO(...);
    
    $stmt = $pdo->prepare("
        SELECT id, slug, first_name, last_name, email, mobile, sms_code
        FROM employees
        WHERE (sms_code = ? OR slug = ?)
        AND active = 1
        LIMIT 1
    ");
    $stmt->execute([$sms_code, $sms_code]);
    return $stmt->fetch();
}
```

## Rep Attribution URL Pattern

All public forms support rep attribution via URL parameters:

```
/vcard-new/farm-request/?rep=C-28
/vcard-new/farm-request/?rep=C-28&rep_name=John+Doe
/vcard-new/assessment/?rep=C-28
```

The `rep` parameter can be:
- SMS code: `C-28`, `C-1`, `C-31`
- Employee slug: `john-doe`

## Admin Panel Navigation

All systems are accessible from the unified admin panel:

```
/vcard-new/admin/
├── index.php                    # Main admin dashboard
├── dashboard-v2.php             # Statistics dashboard
├── social-media-sms-v2.php      # SMS Studio (MMS, Text, Farm Requests, Assessments)
├── email-marketing-v2.php       # Email Marketing
└── pct-web-settings.php         # PCT Website settings
```

---

## Summary: Key Variables by System

### SMS Studio
| Variable | Where | Purpose |
|----------|-------|---------|
| `RENDER_API_URL` | PHP constant | API endpoint |
| `IMAGE_BASE_URL` | PHP constant | Public URL for images |
| `PREVIEW_MODE` | .env file | Test mode toggle |
| `TEST_PHONE_NUMBER` | .env file | Preview recipient |
| `$sms_codes` | PHP array | Code → Name mapping |

### Email Marketing
| Variable | Where | Purpose |
|----------|-------|---------|
| `api-key` file | File system | Mailchimp API key |
| `sales_reps_data.json` | File system | Rep info + audiences |
| `{{SALES_REP_NAME}}` | Template | Personalization placeholder |
| `audience_name` | JSON | Mailchimp audience ID |

### Farm Requests
| Variable | Where | Purpose |
|----------|-------|---------|
| `rep_id` | URL param / DB | Rep attribution |
| `list_type` | Form / DB | Request category |
| `output_formats` | Form / DB | Delivery formats (JSON) |

### Assessments
| Variable | Where | Purpose |
|----------|-------|---------|
| `repCode` | URL param / DB | Rep attribution |
| `capability_score` | Calculated | % of yes answers |
| `avg_confidence_score` | Calculated | Average 1-5 rating |
| `tp_`, `ttb_`, `pao_`, etc. | DB columns | Tool-specific prefixes |

---

**Document Version:** 1.0  
**Created:** March 2026  
**Purpose:** Technical reference for Vercel migration
