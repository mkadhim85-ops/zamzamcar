# 🚀 ZAMZAM CARS — دليل النشر العملي

دليل كامل خطوة بخطوة لتشغيل الموقع على دومين مؤقت (`zamzamcars.vercel.app`) خلال ساعة واحدة.

**الهدف:** موقع شغّال نقدر نشوفه على الإنترنت، نختبر التصميم، ونرجع نضيف الميزات بعدها.

---

## 📋 المتطلبات قبل البدء

تحتاج هذي الحسابات (كلها مجاناً):

- ✅ **GitHub** — لرفع الكود ([github.com](https://github.com))
- ✅ **Vercel** — للاستضافة ([vercel.com](https://vercel.com)) — سجّل بحساب GitHub
- ✅ **Node.js 20+** على جهازك ([nodejs.org](https://nodejs.org))
- ✅ **pnpm** أو **npm** (يأتي مع Node)

**لا تحتاج الآن** (نضيفها لاحقاً عند الحاجة):
- ❌ Vercel KV (cache)
- ❌ DealerCenter API key
- ❌ Google Merchant Account
- ❌ Domain حقيقي

---

## 🏃 المرحلة 1: التشغيل المحلي (5 دقائق)

تأكد أن الكود يشتغل على جهازك قبل الرفع.

```bash
# 1. ادخل المجلد
cd zamzamcar

# 2. ثبّت الـ dependencies
pnpm install
# أو إذا تستعمل npm:
# npm install

# 3. شغّل dev server
pnpm dev
```

افتح المتصفح على **`http://localhost:3000`** → يفترض تشوف:
- الصفحة الرئيسية كاملة
- 6 سيارات في الـ inventory
- الـ filters تشتغل
- اضغط "View Details" → تنتقل لصفحة السيارة المفردة

**إذا ظهرت أخطاء:**

| خطأ | الحل |
|-----|------|
| `Cannot find module 'next'` | `pnpm install` مرة ثانية |
| `Port 3000 already in use` | `pnpm dev --port 3001` |
| `Module not found '@/...'` | تأكد `tsconfig.json` موجود في الجذر |
| TypeScript errors | `pnpm type-check` لرؤية كل الأخطاء |

---

## 📤 المرحلة 2: رفع الكود على GitHub (10 دقائق)

### الخطوة 1: إنشاء repo فاضي على GitHub

1. ادخل [github.com/new](https://github.com/new)
2. اسم الـ repo: `zamzamcar-website` (أو أي اسم)
3. **Private** (مهم — الكود يحتوي business logic)
4. **لا تختار** "Initialize with README"
5. اضغط **Create repository**

### الخطوة 2: ربط الكود المحلي بالـ repo

افتح terminal في مجلد `zamzamcar/`:

```bash
# تهيئة git (إذا مش مهيأ)
git init
git branch -M main

# أضف .gitignore لو غير موجود
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
.next/
out/
build/
dist/

# Misc
.DS_Store
*.pem
.env
.env.local
.env*.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Editor
.vscode/
.idea/
*.swp

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

# ارفع كل الملفات
git add .
git commit -m "Initial commit: ZAMZAM CARS Next.js site"

# اربط بالـ repo (استبدل YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/zamzamcar-website.git
git push -u origin main
```

✅ تحقق من GitHub → يفترض تشوف كل الملفات.

---

## 🚀 المرحلة 3: النشر على Vercel (10 دقائق)

### الخطوة 1: ربط Vercel بـ GitHub

1. ادخل [vercel.com/new](https://vercel.com/new)
2. اضغط **Import Git Repository**
3. اختر `zamzamcar-website` (قد يطلب أذونات لـ Vercel على GitHub)
4. اضغط **Import**

### الخطوة 2: إعدادات النشر

Vercel سيكتشف Next.js تلقائياً. تحقق فقط:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `./` |
| **Build Command** | `next build` (تلقائي) |
| **Output Directory** | `.next` (تلقائي) |
| **Install Command** | `pnpm install` |

### الخطوة 3: Environment Variables (مهمة!)

اضغط **Environment Variables** وأضف **فقط هذي** الآن:

```bash
# عنوان الموقع - مهم للـ SEO والـ canonical URLs
NEXT_PUBLIC_SITE_URL=https://zamzamcars.vercel.app
```

**لا تضيف** الـ variables الباقية الآن (KV, DealerCenter, Google Merchant) لأن الموقع يشتغل بالـ mock data بدونها.

### الخطوة 4: Deploy

اضغط **Deploy** الكبير. انتظر 2-3 دقائق.

✅ بعدها سيعطيك رابط مثل: **`https://zamzamcars.vercel.app`**

---

## ✅ المرحلة 4: التحقق من النشر (5 دقائق)

افتح الرابط في المتصفح وتحقق:

- [ ] الصفحة الرئيسية تحمّل بدون أخطاء
- [ ] الـ hero يظهر بشكل صحيح
- [ ] السيارات الـ 6 ظاهرة
- [ ] الـ filter dropdowns تفتح وتغلق
- [ ] أضغط "View Details" → تفتح صفحة السيارة
- [ ] الـ gallery يشتغل
- [ ] الـ financing widget الـ sliders تتحرك والأرقام تتحدث
- [ ] الـ FAQ accordion يفتح
- [ ] الموبايل responsive (جرّب على الجوال)

**اختبارات SEO سريعة:**

1. اذهب لـ [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. الصق رابط `https://zamzamcars.vercel.app`
3. يفترض يكتشف:
   - ✅ AutoDealer schema
   - ✅ FAQPage schema
   - ✅ AggregateRating

4. اذهب لصفحة سيارة مفردة:
   - `https://zamzamcars.vercel.app/inventory/ZZ-3421`
5. اختبرها برضو → يفترض يكتشف Vehicle schema

---

## 🔄 المرحلة 5: التحديثات المستقبلية

الآن أي تغيير ترفعه على GitHub يتنشر تلقائياً:

```bash
# عدّل أي ملف...
# مثلاً غيّر الـ tagline في src/lib/config.ts

git add .
git commit -m "Update tagline"
git push

# بعد 1-2 دقيقة → الموقع محدّث على zamzamcars.vercel.app
```

**Preview deployments** للتجارب: أي branch غير `main` يحصل على رابط preview منفصل (مفيد للتجارب).

```bash
git checkout -b experiment-new-hero
# عدّل وارفع
git push -u origin experiment-new-hero
# Vercel سيعطيك رابط مثل zamzamcars-git-experiment-new-hero.vercel.app
```

---

## 🐛 حل المشاكل الشائعة

### Build فشل على Vercel

افتح **Deployments → Failed → View Logs** وابحث عن:

| رسالة الخطأ | السبب | الحل |
|------------|-------|------|
| `Type error` | TypeScript issue | شغّل `pnpm type-check` محلياً وأصلح |
| `Module not found` | Import path غلط | تحقق من path aliases في tsconfig |
| `ENOENT: no such file` | Case sensitivity | على Linux أسماء الملفات case-sensitive |
| `Failed to fetch` | Image domain غير مسموح | أضف الـ domain في `next.config.ts` |

### الصور لا تظهر

في `next.config.ts` تأكد من `remotePatterns`:

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    // أضف أي domain آخر تستعمله
  ],
}
```

### الـ fonts بطيئة

Next.js يحمّل Inter + JetBrains Mono من Google Fonts. إذا كانت بطيئة:
- تأكد `display: "swap"` في `layout.tsx`
- على Vercel هذا يتحسن تلقائياً بعد أول request

---

## 📊 ما الذي يعمل الآن؟

### ✅ يعمل بدون أي إعداد إضافي:

- الصفحة الرئيسية كاملة بالـ mock data
- صفحات السيارات المفردة (6 سيارات)
- الـ filters والـ tabs
- الـ gallery + lightbox
- الـ financing widget (يحسب فعلياً)
- الـ OTD calculator
- كل الـ Schema.org JSON-LD
- Sitemap + robots.txt
- 404 page

### ⏸️ يحتاج إعداد لاحقاً:

| الميزة | متى نضيفها | ما المطلوب |
|--------|------------|-----------|
| **Live inventory** | بعد تأكيد التصميم | DealerCenter API credentials |
| **Cache** | عند زيادة الزيارات | Vercel KV (مجاني حتى حد معين) |
| **Google Merchant feed** | للإعلانات المدفوعة | Service account + merchant ID |
| **Marketing feeds** | للنشر على CarGurus/Meta | URLs فقط |
| **Email/SMS** | لاستقبال الـ leads | Resend أو Twilio |
| **Analytics** | لقياس الأداء | Vercel Analytics (مجاني) |

---

## 🎯 الخطوات التالية (بعد رؤية الموقع شغّال)

أرجع لي بعد رؤية الموقع على الدومين المؤقت وأخبرني:

1. **أي تعديلات تصميمية** تحتاجها قبل المتابعة؟
2. **متى تريد** ربط الـ DealerCenter API (تحتاج credentials منهم)؟
3. **متى** تريد دومين حقيقي (`zamzamcar.com`)؟

من هناك نقرر الأولوية التالية:
- Inventory page بـ filters جانبية
- Financing page مع pre-qual form
- ربط الـ live data
- Admin dashboard
- صفحات إضافية (Trade-In, About, Contact)

---

## 💡 نصائح مهمة قبل البدء

1. **احفظ نسخة من الكود محلياً** قبل أي تعديل كبير
2. **اعمل branch جديد** لأي تجربة (`git checkout -b try-new-color`)
3. **اقرأ الـ Vercel logs** عند أي build failure — 90% من الأخطاء واضحة هناك
4. **لا تضع secrets في الكود** — استعمل Environment Variables دائماً
5. **اختبر على الموبايل** — أكثر من 60% من زوار dealerships من الموبايل

---

**جاهز نبدأ؟** ابدأ بالمرحلة 1 (التشغيل المحلي) وأخبرني إذا واجهت أي مشكلة.
