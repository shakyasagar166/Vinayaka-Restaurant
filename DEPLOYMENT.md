# 🚀 Garam Masala Family Restaurant: Production Deployment & Domain Guide

Yeh guide aapko apni website ko Vercel + Render + Aiven/MySQL par live publish karne aur **Domain name ko Vinayaka se badalkar Garam Masala karne** ke pure steps explain karti hai!

---

## 🌐 Vercel Par Domain Name Kaise Badlein (Vinayaka Se Garam Masala)

Agar aapki website pehle se Vercel par live hai aur uska domain `vinayaka-restaurant.vercel.app` aa raha hai, to usko **`garam-masala`** karne ke liye ye 4 aasan steps follow karein:

### Step 1: Vercel Dashboard Kholein
1. [https://vercel.com](https://vercel.com) par jayein aur login karein.
2. Apne restaurant wale project par click karein.

### Step 2: Settings ➔ Domains Me Jayein
1. Upar menu bar me **"Settings"** par click karein.
2. Left sidebar menu me **"Domains"** par click karein.

### Step 3: Naya Domain Add / Edit Karein
1. Aapko wahan purana domain dikhega (jaise `vinayaka-restaurant.vercel.app`).
2. Box me naya domain name likhein, jaise:
   - 👉 **`garam-masala-restaurant.vercel.app`**
   - ya 👉 **`ghaziabad-garam-masala.vercel.app`**
   - ya 👉 **`garammasala-restaurant.vercel.app`**
   *(Note: Vercel par jo subdomain free aur available hoga wo turant assign ho jayega!)*
3. **"Add"** ya **"Save"** button dabayein.
4. Purane `vinayaka` wale domain ko aap wahi **Delete** kar sakte hain ya redirect bana sakte hain!

### Step 4 (Optional): Project Name Bhi Badlein
1. **Settings** ➔ **General** me jayein.
2. **Project Name** me `vinayaka-restaurant` ki jagah likhein: **`garam-masala-restaurant`**
3. **Save** button dabayein.

---

## 🏗️ आर्किटेक्चर (Production Architecture)

```
[Customer Mobile / QR Code Scan]
                 │
                 ▼
     [Vercel Frontend (React + Vite)]
                 │  (REST API / HTTPS)
                 ▼
    [Render Backend (Spring Boot Docker)]
                 │  (PostgreSQL SSL)
                 ▼
   [Neon Database (Serverless PostgreSQL)]
```

---

## ⚡ Step 1: Neon Database सेटअप (Database बनाएं - 2 मिनट)

1. [https://neon.tech](https://neon.tech) पर जाएं और फ्री अकाउंट बनाएं (Google या GitHub से लॉगिन करें)।
2. **"Create Project"** पर क्लिक करें:
   - **Project Name:** `vinayaka-restaurant`
   - **Database Name:** `neondb` (Default)
3. प्रोजेक्ट बनने के बाद आपको **Connection Details** दिखेगी:
   - Dropdown में **`Connection String`** (URI) चुनें।
   - यह कुछ ऐसा दिखेगा:
     ```text
     postgresql://neondb_owner:npg_AbCdEf123@ep-cool-cloud-a5xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **इस पूरे Connection String को कॉपी कर लें।** (यह Step 2 में काम आएगा)।

4. **डेटाबेस स्कीमा और मेन्यू लोड करें:**
   - Neon डैशबोर्ड में बायीं तरफ **"SQL Editor"** पर क्लिक करें।
   - `database/neon_postgres_schema.sql` फ़ाइल के पूरे कोड को कॉपी करके पेस्ट करें।
   - **"Run"** बटन दबाएं।  
   *(सारे टेबल्स, एडमिन क्रेडेंशियल्स और रूफटॉप डिशेज़ Neon में लोड हो जाएंगी!)*

---

## ⚙️ Step 2: Render पर Backend डिप्लॉय करें (Spring Boot - 3 मिनट)

1. अपने प्रोजेक्ट को GitHub रिपॉजिटरी में पुश कर लें:
   ```bash
   git init
   git add .
   git commit -m "Vinayaka restaurant production release"
   git remote add origin https://github.com/YOUR_USERNAME/vinayaka-restaurant.git
   git push -u origin main
   ```

2. [https://render.com](https://render.com) पर जाएं और लॉगिन करें।
3. **"New +"** बटन दबाकर **"Web Service"** चुनें।
4. अपनी GitHub रिपॉजिटरी (`vinayaka-restaurant`) कनेक्ट करें।
5. सेटिंग्स भरें:
   - **Name:** `vinayaka-restaurant-backend`
   - **Region:** `Oregon` ya `Frankfurt` (Neon ke pass wala)
   - **Root Directory:** `backend`
   - **Runtime:** **Docker**  
     *(Render ऑटोमैटिकली `backend/Dockerfile` डिटेक्ट कर लेगा!)*
   - **Instance Type:** `Free`

6. **Environment Variables (पर्यावरण चर) जोड़ें:**
   Neeche **"Advanced" ➔ "Add Environment Variable"** par click karein:
   - **Key:** `DATABASE_URL`  
     **Value:** (Step 1 mein copy kiya hua Neon Connection String paste karein)
   - **Key:** `PORT`  
     **Value:** `8080`

7. **"Deploy Web Service"** पर क्लिक करें!
   - 2-3 मिनट में Render आपकी Spring Boot एप्लीकेशन को Docker में बिल्ड करके लाइव कर देगा।
   - ऊपर आपको अपना लाइव Backend URL मिलेगा:
     👉 **`https://vinayaka-restaurant-backend.onrender.com`** (इसे कॉपी कर लें!)

---

## 🌐 Step 3: Vercel पर Frontend डिप्लॉय करें (React App - 2 मिनट)

1. [https://vercel.com](https://vercel.com) पर जाएं और लॉगिन करें।
2. **"Add New..."** ➔ **"Project"** पर क्लिक करें।
3. अपनी वही GitHub रिपॉजिटरी (`vinayaka-restaurant`) चुनें और **Import** करें।
4. प्रोजेक्ट सेटिंग्स में:
   - **Project Name:** `vinayaka-restaurant`
   - **Framework Preset:** `Vite` (अपने-आप डिटेक्ट हो जाएगा)
   - **Root Directory:** **Edit** पर क्लिक करके **`frontend`** सेलेक्ट करें!
5. **Environment Variables जोड़ें:**
   - **Key:** `VITE_API_URL`
   - **Value:** Step 2 का Render Backend URL:
     `https://vinayaka-restaurant-backend.onrender.com`
6. **"Deploy"** पर क्लिक करें!
   - 30 सेकंड में आपकी वेबसाइट पूरी दुनिया के लिए लाइव हो जाएगी:
     👉 **`https://vinayaka-restaurant.vercel.app`**

---

## 🎯 Step 4: लाइव वेबसाइट की जांच और QR कोड

1. **कस्टमर की तरह खोलें:**  
   मोबाइल या लैपटॉप पर:  
   👉 `https://vinayaka-restaurant.vercel.app/?table=Rooftop-01`
2. **ऑर्डर करें:**  
   कार्ट में आइटम जोड़ें, नाम डालें और ऑर्डर करें।
3. **एडमिन पोर्टल खोलें:**  
   👉 `https://vinayaka-restaurant.vercel.app` ➔ **Staff Login**
   - **Username:** `admin`
   - **Password:** `vinayaka@123`
4. **QR कोड प्रिंट करें:**  
   - एडमिन में **"Table QR Generator"** टैब खोलें।
   - **"Print All QR Cards"** दबाएं।
   - अब आपके पास अपनी हर डाइनिंग टेबल का असली QR कोड प्रिंट होकर तैयार हो जाएगा!
