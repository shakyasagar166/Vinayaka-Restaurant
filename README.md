# 🌟 Vinayaka Restaurant (Rooftop & Lounge) - QR Dine-In Ordering System

> **कॉन्टैक्टलेस डाइनिंग & किचन मैनेजमेंट सिस्टम (QR Code Table Ordering Platform)**  
> **Tech Stack:** Spring Boot 3 (Java 17), MySQL 8.0, React 18 (Vite, Tailwind CSS, Lucide Icons, QRCode.react)

---

## 📖 प्रोजेक्ट का विवरण (Project Overview)

यह सिस्टम **Vinayaka Restaurant (Rooftop & Lounge)** के लिए विशेष रूप से डिज़ाइन किया गया है:

1. **टेबल पर QR कोड स्कैनिंग:** 
   - ग्राहक (Customer) रूफटॉप या लाउंज की किसी भी डाइनिंग टेबल पर बैठता है।
   - टेबल पर लगे QR कोड को अपने मोबाइल कैमरे से स्कैन करता है (उदा. `http://localhost:5173/?table=Rooftop-01`)।
   - तुरंत रेस्टोरेंट का डिजिटल मेन्यू खुल जाता है जिसमें टेबल नंबर अपने-आप सेट रहता है।

2. **बिना किसी लॉगिन के तुरंत ऑर्डर (NO Customer Login Needed):**
   - ग्राहक को किसी भी प्रकार के रजिस्ट्रेशन या पासवर्ड की ज़रूरत नहीं है।
   - वे डिशेज़ चुनते हैं, कस्टमाइज़ करते हैं (जैसे *Less spicy*, *Extra cheese*), अपना नाम डालते हैं और **"Place Order / ऑर्डर भेजें"** पर क्लिक करते हैं।
   - ऑर्डर सीधा किचन स्क्रीन (Kitchen Display System) पर चला जाता है।
   - ग्राहक अपने मोबाइल पर लाइव स्टेटस देख सकता है: *Order Received* ➔ *Cooking in Kitchen* ➔ *Served on Table* ➔ *Completed*।

3. **विनायक रेस्टोरेंट स्टाफ/मैनेजर लॉगिन (Staff Only Authentication):**
   - केवल रेस्टोरेंट का स्टाफ या मैनेजर ही लॉगिन कर सकता है।
   - **डिफ़ॉल्ट क्रेडेंशियल्स:**
     - **Username:** `admin`
     - **Password:** `vinayaka@123`

4. **"आज क्या क्या है" मेन्यू कंट्रोल (Daily Stock & Availability):**
   - स्टाफ एक क्लिक में किसी भी डिश को **"Available Today"** या **"Sold Out / आज खत्म"** टॉगल कर सकता है।
   - नया आइटम जोड़ना, रेट बदलना, और डिलीट करना।

5. **लाइव किचन ऑर्डर बोर्ड (KDS):**
   - किस टेबल के किस ग्राहक ने क्या-क्या ऑर्डर किया, कितने बजे ऑर्डर आया, कुल बिल कितना है।
   - शेफ के लिए स्टेटस चेंज बटन: *Start Cooking*, *Mark Served*, *Mark Paid*।

6. **टेबल QR कोड जनरेटर & प्रिंटेबल स्टैण्डीज़ (Printable Standees):**
   - रूफटॉप और लाउंज की सभी टेबल्स के लिए ब्रांडेड QR कार्ड जनरेट होते हैं।
   - सीधे **Print** बटन दबाकर इन्हें प्रिंट करके टेबल्स पर लगाया जा सकता है।

---

## 🏗️ प्रोजेक्ट स्ट्रक्चर (Project Architecture)

```
vinayaka-restaurant/
├── backend/                       # Spring Boot 3 Backend
│   ├── pom.xml                    # Maven dependencies (JPA, MySQL, Security, JJWT)
│   └── src/main/
│       ├── java/com/vinayaka/restaurant/
│       │   ├── VinayakaRestaurantApplication.java
│       │   ├── config/            # JWT, Security, CORS
│       │   ├── controller/        # REST Controllers (Menu, Orders, Tables, Auth, Stats)
│       │   ├── dto/               # Request & Response DTOs
│       │   ├── model/             # JPA Entities (Order, OrderItem, MenuItem, DiningTable, User)
│       │   ├── repository/        # Spring Data Repositories
│       │   └── service/           # Business logic & DataInitializer (Seed Data)
│       └── resources/
│           └── application.properties # MySQL connection configuration
├── frontend/                      # Modern React 18 Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── api/api.js             # Spring Boot REST API integration & Offline Fallback
│   │   ├── context/               # CartContext & AuthContext
│   │   ├── components/            # Navbar, MenuCard, CartDrawer, TableSelector
│   │   ├── pages/                 # CustomerMenu, OrderSuccess, AdminLogin, AdminDashboard, AdminOrders, AdminMenu, AdminTablesQr
│   │   ├── App.jsx
│   │   └── main.jsx
├── database/
│   └── vinayaka_db.sql            # Full MySQL schema & sample seed data
└── README.md
```

---

## 🚀 चलाने का आसान तरीका (How to Run the Project)

### 1️⃣ MySQL डेटाबेस सेटअप (Database Setup)

1. MySQL Workbench, phpMyAdmin, या MySQL Command Line खोलें।
2. निम्न कमांड चलाएँ:
   ```sql
   CREATE DATABASE IF NOT EXISTS vinayaka_restaurant_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. `database/vinayaka_db.sql` फ़ाइल को इम्पोर्ट कर लें।  
   *(नोट: यदि आप इम्पोर्ट नहीं भी करते हैं, तो Spring Boot का `DataInitializer` पहली बार चलने पर डिफ़ॉल्ट डेटा अपने-आप भर देता है!)*

4. `backend/src/main/resources/application.properties` में अपना MySQL पासवर्ड चेक कर लें:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=root   <-- (अपना MySQL पासवर्ड डालें)
   ```

---

### 2️⃣ स्प्रिंग बूट बैकएंड चालू करना (Run Spring Boot Backend)

टर्मिनल / कमांड प्रॉम्प्ट में:
```bash
cd backend
mvn spring-boot:run
```
*(या इस प्रोजेक्ट को IntelliJ IDEA या Eclipse में Open करके `VinayakaRestaurantApplication.java` को Run करें)*

> **बैकएंड चालू होने पर:**  
> API URL: `http://localhost:8080/api`  
> डिफ़ॉल्ट डेटा (Admin: `admin` / `vinayaka@123`, Tables & Dishes) अपने-आप लोड हो जाएगा।

---

### 3️⃣ रिएक्ट फ्रंटएंड चालू करना (Run React Frontend)

दूसरे टर्मिनल में:
```bash
cd frontend
npm install
npm run dev
```

> **फ्रंटएंड चालू होने पर:**  
> ब्राउज़र में खोलें: `http://localhost:5173`

---

## 📱 कस्टमर और स्टाफ के लिए कैसे काम करेगा? (User Flow)

### 🍽️ ग्राहक (Customer Flow):
1. **QR कोड स्कैन करें:**  
   - ब्राउज़र में खोलें: `http://localhost:5173/?table=Rooftop-01`
   - टेबल नंबर अपने-आप डिटेक्ट हो जाएगा (उदा. *Table: Rooftop-01*)।
2. **मेन्यू देखें:**  
   - Veg / Non-Veg फ़िल्टर, शेफ स्पेशल, सर्च बार, और कैटेगरीज़ (*Rooftop Starters*, *Main Course*, *Rooftop Mocktails*, आदि)।
3. **ऑर्डर करें:**  
   - कार्ट खोलें, अपना नाम डालें (उदा. *Rahul Sharma*), कोई खास निर्देश (उदा. *Kam mirch*), और **Place Order** दबाएँ।
4. **लाइव ट्रैकिंग:**  
   - स्क्रीन पर तुरंत लाइव स्टेटस दिखेगा: *Order Received* ➔ *Cooking* ➔ *Served*।

### 👨‍🍳 रेस्टोरेंट स्टाफ / मैनेजर (Staff Flow):
1. टॉप-राइट कॉर्नर में **Shield Icon (🛡️)** या फूटर में **Staff Login** पर क्लिक करें।
2. लॉगिन करें:
   - **Username:** `admin`
   - **Password:** `vinayaka@123`
3. **लाइव किचन ऑर्डर बोर्ड:** 
   - सारे टेबल्स के लाइव ऑर्डर्स देखें, शेफ खाना शुरू करे तो *Start Cooking* दबाए, खाना टेबल पर जाए तो *Mark Served* दबाए।
4. **"आज क्या क्या है" मेन्यू कंट्रोल:**
   - जो आइटम आज खत्म हो गया है, उसके सामने *Available* बटन दबाकर तुरंत *Sold Out* कर दें। ग्राहक को वह आइटम नहीं दिखेगा।
   - नई डिश जोड़ें या रेट अपडेट करें।
5. **QR कोड प्रिंट करें:**
   - *Table QR Generator* टैब में जाएँ और **Print All QR Cards** दबाकर प्रिंट निकालें और अपनी टेबल्स पर लगाएँ।

---

## 🔒 सिक्योरिटी & एपीआई सुरक्षा (API Security)

- **Public Endpoints (बिना लॉगिन):** 
  - `GET /api/menu` (मेन्यू देखना)
  - `POST /api/orders` (टेबल से ऑर्डर भेजना)
  - `GET /api/orders/track/{orderNumber}` (अपना ऑर्डर ट्रैक करना)
  - `GET /api/tables/active` (टेबल लिस्ट)
- **Protected Endpoints (स्टाफ JWT टोकन अनिवार्य):**
  - `GET /api/orders` (सारे कस्टमर्स के ऑर्डर्स देखना)
  - `PATCH /api/orders/{id}/status` (ऑर्डर स्टेटस बदलना)
  - `POST/PUT/DELETE /api/menu` (मेन्यू में बदलाव करना)
  - `GET /api/stats/**` (दैनिक कमाई और हिसाब-किताब)
