# حقل الألغام - دليل الإعداد 🎮

## تعليمات الإعداد السريع

اللعبة الآن تدعم اللعب متعدد اللاعبين عبر الإنترنت باستخدام **Firebase Realtime Database**!

### خطوات الإعداد:

#### 1️⃣ إنشاء مشروع Firebase
- اذهب إلى [Firebase Console](https://console.firebase.google.com)
- انقر "Create Project" (إنشاء مشروع)
- أدخل اسم المشروع: `minebattle` (أو أي اسم تفضله)
- اختر الموقع الجغرافي الأقرب لك
- انقر "Create"

#### 2️⃣ تفعيل Realtime Database
- في لوحة التحكم، انقر "Realtime Database" من القائمة اليسرى
- انقر "Create Database"
- اختر الموقع الجغرافي مرة أخرى
- اختر **Test Mode** (وضع الاختبار) في قواعد الأمان
- انقر "Enable"

#### 3️⃣ الحصول على بيانات المشروع
- في "Realtime Database"، انقر على رمز الترس (Settings) ⚙️
- اختر "Project Settings"
- انسخ بيانات المشروع من `firebaseConfig` (ستجد كود JavaScript)
- سيبدو شيء مثل:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

#### 4️⃣ تحديث firebase-config.js
- افتح ملف `firebase-config.js` في المشروع
- استبدل `firebaseConfig` بقيمتك:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

#### 5️⃣ اختبر اللعبة
- افتح `index.html` في المتصفح
- اختبر الميزات:
  - 🤖 اللعب ضد الذكاء الاصطناعي (يعمل بدون Firebase)
  - 👥 اللعب مع لاعب حقيقي (يحتاج Firebase):
    - افتح نافذتين متصفح
    - أنشئ غرفة على النافذة الأولى، احصل على الكود
    - انضم باستخدام الكود على النافذة الثانية

### ⚠️ ملاحظة أمان مهمة
- لا تشارك بيانات Firebase الخاصة بك علنًا على GitHub
- لحماية بيانات Firebase:
  1. لا تضع firebase-config.js في المشروع العام
  2. أو استخدم متغيرات البيئة (انظر القسم التالي)

### 🔒 استخدام متغيرات البيئة (اختياري)
للأمان الأفضل عند رفع على GitHub:

1. أنشئ ملف `.env.local` (لن يتم رفعه):
```
FIREBASE_API_KEY=YOUR_API_KEY
FIREBASE_PROJECT_ID=YOUR_PROJECT
FIREBASE_DATABASE_URL=https://YOUR_PROJECT-default-rtdb.firebaseio.com
```

2. أضف `.env.local` إلى `.gitignore`

3. تحديث `firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBRgG7K8mP2nQ9xR5sT7uV9wX1yZ2aB3cD",
  authDomain: "minebattle-rtdb.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://minebattle-rtdb-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "minebattle-rtdb",
  storageBucket: "minebattle-rtdb.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 📤 رفع على GitHub

1. **إنشاء مستودع GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: Minefield game with multiplayer support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/minebattle.git
git push -u origin main
```

2. **اضف .gitignore:**
```
node_modules/
.env
.env.local
*.log
```

3. **أضف README.md:**
```markdown
# حقل الألغام 💣⚡

لعبة مينسويبر تنافسية بأسلوب Dragon Ball Z!

## الميزات
- 🤖 لعب ضد الذكاء الاصطناعي
- 👥 لعب متعدد اللاعبين عبر الإنترنت
- 🎨 واجهة مستخدم جميلة بتصميم عصري
- 🎵 مؤثرات صوتية تفاعلية

## كيفية اللعب
- أنشئ غرفة أو انضم برمز الغرفة
- ضع ألغامك لخصمك
- تنافس على نقر الخلايا الآمنة!
```

### 🐛 حل مشاكل شائعة

**المشكلة:** "فشل الاتصال عند انضمام الغرفة"
- ✅ تحقق من firebase-config.js محدث بشكل صحيح
- ✅ تحقق من Realtime Database مفعل في Firebase
- ✅ تحقق من قواعد الأمان في وضع "Test Mode"

**المشكلة:** "اللعبة تعمل لكن بدون تزامن"
- ✅ قد تكون تستخدم BroadcastChannel (نفس الجهاز فقط)
- ✅ تأكد من أن Firebase مهيأ بشكل صحيح
- ✅ افتح وحدة التحكم (F12) وابحث عن الأخطاء

### 📞 الدعم
- اطلب مساعدة من [Firebase Documentation](https://firebase.google.com/docs)
- أو [StackOverflow](https://stackoverflow.com/questions/tagged/firebase)

---

## Setup Guide (English)

The game now supports **online multiplayer** using Firebase Realtime Database!

### Quick Setup Steps:

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project named `minebattle`

2. **Enable Realtime Database:**
   - Create a new Realtime Database
   - Start in **Test Mode**

3. **Get Your Config:**
   - Copy your `firebaseConfig` from Project Settings

4. **Update `firebase-config.js`:**
   - Replace the placeholder config with your values

5. **Test & Deploy:**
   - Test in 2 browser windows
   - Push to GitHub

See the Arabic section above for detailed steps!
