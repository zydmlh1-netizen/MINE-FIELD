# 📤 دليل النشر على GitHub | GitHub Deployment Guide

## الخطوة 1️⃣ : تحضير المستودع | Prepare Repository

### إذا بدأت من الصفر | Starting Fresh:

```bash
# انتقل إلى مجلد المشروع
cd "c:/Users/user/OneDrive/Documents/محرم"

# أنشئ مستودع Git محلي
git init

# أضف جميع الملفات
git add .

# أنشئ الـ commit الأول
git commit -m "🎮 Initial commit: Minefield game with multiplayer"

# غيّر اسم الفرع إلى main (المعيار الجديد)
git branch -M main
```

---

## الخطوة 2️⃣ : إنشاء مستودع GitHub | Create GitHub Repository

1. اذهب إلى [GitHub.com](https://github.com)
2. تسجيل الدخول أو إنشاء حساب
3. انقر ➕ في الزاوية العلوية اليمين
4. اختر **New repository**
5. أدخل التفاصيل:
   - **Repository name:** `minebattle` (أو أي اسم)
   - **Description:** `Dragon Ball Z Minesweeper Battle - Online Multiplayer Game`
   - **Public** ✅ (لمشاركة عامة)
   - **Initialize with README:** ❌ (سنستخدم الملف الموجود)
6. انقر **Create repository**

---

## الخطوة 3️⃣ : ربط المستودع المحلي | Connect Local Repository

GitHub سيعطيك رابط المستودع. استخدمه هنا:

```bash
# أضف المستودع البعيد
git remote add origin https://github.com/YOUR_USERNAME/minebattle.git

# تحقق من الاتصال
git remote -v
```

يجب أن تراه مثل:
```
origin  https://github.com/YOUR_USERNAME/minebattle.git (fetch)
origin  https://github.com/YOUR_USERNAME/minebattle.git (push)
```

---

## الخطوة 4️⃣ : النشر الأول | First Push

```bash
# رفع الملفات إلى GitHub
git push -u origin main

# أو إذا كنت تستخدم SSH:
git push -u origin main --force
```

### في حالة الخطأ | If Error:

**خطأ: "Authentication Failed"**
- استخدم Personal Access Token بدلاً من كلمة المرور
- اتبع [هذا الدليل](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

---

## الخطوة 5️⃣ : تفعيل GitHub Pages (اختياري) | Enable GitHub Pages

لنشر اللعبة مباشرة من GitHub:

1. في صفحة المستودع، اذهب إلى **Settings** ⚙️
2. من القائمة اليسرى، اختر **Pages**
3. تحت **Source**، اختر:
   - Branch: `main`
   - Folder: `/ (root)`
4. انقر **Save**

سيتم نشر اللعبة على:
```
https://YOUR_USERNAME.github.io/minebattle/
```

---

## الخطوة 6️⃣ : إضافة Firebase Config | Add Firebase Configuration

### ⚠️ أمان مهم | Security Important:

**لا تشارك firebase-config.js مع مفاتيح حقيقية!**

### الحل 1: استخدام .env و .gitignore

```bash
# 1. أنشئ ملف .env.example (بدون قيم حقيقية)
cat > .env.example << EOF
FIREBASE_API_KEY=YOUR_API_KEY_HERE
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
FIREBASE_DATABASE_URL=https://YOUR_PROJECT-default-rtdb.firebaseio.com
EOF

# 2. أضفه إلى git
git add .env.example
git commit -m "Add environment variables template"
git push
```

### الحل 2: استخدام GitHub Secrets (للـ Deployment)

1. في **Settings** → **Secrets and variables** → **Actions**
2. أنقر **New repository secret**
3. أضف القيم:
   - `FIREBASE_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_DATABASE_URL`

---

## الخطوة 7️⃣ : اختبر النشر | Test Deployment

1. افتح اللعبة على الرابط الجديد
2. اختبر الميزات:
   - ✅ تحميل الصفحة بسرعة
   - ✅ الصور تظهر صحيحة
   - ✅ الأزرار تعمل
   - ✅ الصوت يعمل
   - ✅ Firebase متصل (إذا كان مهيأ)

---

## 📝 رسائل Commit الجيدة | Good Commit Messages

استخدم رسائل واضحة ووصفية:

```bash
# ✅ جيد
git commit -m "🎮 Add Firebase multiplayer support"
git commit -m "🐛 Fix connection timeout issue"
git commit -m "✨ Add sound effects"
git commit -m "📚 Update documentation"

# ❌ سيء
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

### رموز Emoji مفيدة:
- 🎮 Feature جديدة
- 🐛 حل مشكلة
- ✨ تحسين
- 📚 توثيق
- 🔧 إصلاح
- 🚀 Deployment

---

## 🔄 تحديثات مستقبلية | Future Updates

بعد النشر الأول، لتحديث المشروع:

```bash
# عمل التعديلات محليًا
# ثم:

# إضافة التغييرات
git add .

# إنشاء commit
git commit -m "📝 Your message here"

# رفع التحديثات
git push
```

---

## ✅ قائمة التحقق | Checklist

قبل النشر، تأكد من:

- [ ] ✅ جميع الملفات موجودة في المجلد
- [ ] ✅ firebase-config.js محدث (أو استخدام .env)
- [ ] ✅ .gitignore موجود ومحدّث
- [ ] ✅ README.md واضح
- [ ] ✅ اختبار اللعبة محليًا
- [ ] ✅ لا توجد مسافات غريبة في الملفات العربية
- [ ] ✅ جميع الصور موجودة

---

## 🎉 تم!

اللعبة الآن على GitHub! 🚀

### خطوات إضافية:
1. شارك الرابط مع الأصدقاء
2. ابدأ بـ Star ⭐ على GitHub (للدعم!)
3. أضف مميزات جديدة
4. ألهم الآخرين بمشروعك!

---

## 🆘 استكشاف الأخطاء | Troubleshooting

### خطأ: "permission denied (publickey)"
```bash
# استخدم HTTPS بدلاً من SSH
git remote set-url origin https://github.com/YOUR_USERNAME/minebattle.git
```

### خطأ: "rejected (non-fast-forward)"
```bash
# سحب آخر التعديلات أولاً
git pull origin main --rebase
git push origin main
```

### خطأ: "git not found"
- [تحميل Git](https://git-scm.com/download/win)
- أعد تشغيل Terminal

---

## 📖 المراجع | References

- [GitHub Docs](https://docs.github.com)
- [Git Tutorial](https://git-scm.com/book/en/v2)
- [GitHub Pages Guide](https://pages.github.com)

---

**شارك المشروع وتمتع! 🎮✨**
