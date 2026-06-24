# حقل الألغام 💣⚡ | Mine Field Game

لعبة مينسويبر تنافسية بأسلوب Dragon Ball Z مع دعم اللعب متعدد اللاعبين عبر الإنترنت!

**Dragon Ball Z themed Minesweeper battle game with online multiplayer support!**

---

## ✨ الميزات | Features

- 🤖 **لعب ضد الذكاء الاصطناعي** - Play against AI
- 👥 **لعب متعدد اللاعبين** - Real-time online multiplayer with Firebase
- 🎨 **تصميم حديث** - Beautiful UI with glass-morphism effects
- 🎵 **مؤثرات صوتية** - Dynamic audio feedback
- 📱 **واجهة سريعة الاستجابة** - Responsive design for all devices
- ⚡ **أداء عالي** - Pure JavaScript, no dependencies

---

## 🎮 قواعد اللعبة | Game Rules

1. **أنشئ غرفة** أو **انضم برمز** - Create or join a room
2. **ضع ألغامك** في شبكة خصمك خلال 20 ثانية - Place your mines on opponent's board
3. **اضغط على الخلايا** - Click cells on your board
   - ✅ **آمن** = Safe cell revealed
   - 💥 **ينفجر** = Mine explodes
4. **الأدوار تتبادل** - Turns alternate automatically
5. **الخاسر** من ينفجر آخر لغم لديه - Last exploded mine = Game Over

---

## 🚀 البدء السريع | Quick Start

### للعب المحلي (نفس الجهاز) | Local Play (Same Device):
```bash
# افتح index.html مباشرة
# Open index.html directly
```
- لا تحتاج لأي إعداد!
- استخدم BroadcastChannel تلقائياً

### للعب متعدد اللاعبين | Online Multiplayer:
1. ✅ **اتبع** [SETUP.md](SETUP.md) لإعداد Firebase
2. ✅ **حدّث** `firebase-config.js` ببيانات مشروعك
3. ✅ **افتح** `index.html` وأنشئ غرفة
4. ✅ **شارك** الكود مع لاعب آخر

---

## 📁 هيكل المشروع | Project Structure

```
محرم/
├── index.html              # الصفحة الرئيسية
├── game.js                 # منطق اللعبة الأساسي
├── style.css               # الأنماط والتصميم
├── firebase-config.js      # إعدادات Firebase
├── SETUP.md                # دليل الإعداد
├── README.md               # هذا الملف
├── image.png               # شعار اللعبة
├── bg.png                  # صورة الخلفية
└── explosion.png           # صورة الانفجار
```

---

## 🔧 التكنولوجيا | Technology

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Multiplayer:** Firebase Realtime Database
- **Audio:** Web Audio API
- **Animation:** CSS3 Keyframes + JavaScript

---

## 📖 كيفية اللعب | How to Play

### المرحلة 1: اختيار الوضع | Mode Selection
- اختر 🤖 الذكاء الاصطناعي أو 👤 لاعب حقيقي

### المرحلة 2: إعدادات اللعبة | Game Setup
- حجم الشبكة: 6×6 إلى 12×12
- عدد الألغام: سهل إلى جهنم

### المرحلة 3: وضع الألغام | Placement
- 20 ثانية لوضع الألغام
- اضغط المربعات لوضع الألغام
- انتظر الخصم أو استكمل تلقائياً

### المرحلة 4: اللعبة الرئيسية | Game Phase
- دورك: اضغط على خليتك (شبكة الخصم من منظورك)
- ثم انظر: شاهد ما يختاره الخصم
- كرر حتى ينفجر آخر لغم!

---

## ⚙️ الإعدادات المتقدمة | Advanced Setup

### استخدام متغيرات البيئة | Environment Variables:

أنشئ `.env.local`:
```env
FIREBASE_API_KEY=YOUR_KEY
FIREBASE_PROJECT_ID=YOUR_PROJECT
FIREBASE_DATABASE_URL=https://YOUR_PROJECT-default-rtdb.firebaseio.com
```

تحديث `firebase-config.js`:
```javascript
const firebaseConfig = {
  apiKey: localStorage.getItem('FIREBASE_API_KEY') || "default_key",
  // ... etc
};
```

---

## 🐛 حل المشاكل | Troubleshooting

| المشكلة | الحل |
|--------|------|
| "فشل الاتصال" | تحقق من firebase-config.js صحيح |
| "الغرفة غير موجودة" | تأكد من الكود صحيح (6 أحرف) |
| "لا تزامن بين اللاعبين" | تحقق من Firebase Database مفعل |
| "الصوت لا يعمل" | تحقق من إذن Audio في المتصفح |

---

## 📤 نشر على GitHub | Deploy to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Minefield game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/minebattle.git
git push -u origin main
```

### ⚠️ أمان مهم | Security Important:
**لا تشارك firebase-config.js إذا كانت تحتوي على مفاتيح حقيقية!**

أضف `.gitignore`:
```
.env
.env.local
firebase-config.js  # إذا كانت بمفاتيح حقيقية
node_modules/
```

---

## 🚀 نشر الويب | Web Deployment

### GitHub Pages:
```bash
# الملفات الثابتة فقط (HTML, CSS, JS)
# التفعيل من Settings > Pages
```

### Netlify:
```bash
# رفع مباشر من GitHub
# أو: netlify deploy --prod
```

### Vercel:
```bash
# نفس الطريقة من GitHub
```

---

## 📝 الترخيص | License

هذا المشروع مفتوح المصدر ومتاح للاستخدام الحر.

---

## 🎯 الخطوات التالية | Next Steps

- [ ] اتبع [SETUP.md](SETUP.md)
- [ ] أنشئ مشروع Firebase
- [ ] حدّث firebase-config.js
- [ ] اختبر اللعبة
- [ ] ارفع على GitHub
- [ ] شارك مع الأصدقاء! 🎉

---

## 👨‍💻 المطور | Developer

**Created with ⚡ by:** HAIDER MUSHTAQ

---

## 💬 التواصل | Contact

- 📧 For support: Check Firebase docs or StackOverflow
- 🐛 عثرت على مشكلة؟ Report on GitHub Issues

---

**آمل أن تستمتع باللعبة! 🎮**

**Enjoy the game! 🎮**
