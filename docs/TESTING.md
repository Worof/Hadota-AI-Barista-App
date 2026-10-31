# الاختبار والتصحيح

| الأمر | بيعمل إيه | محتاج |
|---|---|---|
| `npm test` | ٢٨ اختبار: صحة التوصيات + التعلّم (Node فقط، من غير تثبيت) | Node 20+ |
| `npm run test:py` | ٩ اختبارات لحزمة التحليل | Python + pandas/numpy/matplotlib |
| `npm run e2e` | ١٤ اختبار على متصفح حقيقي (الاستبيان، التقييم، التعليق، الجلسة) | `pip install playwright && playwright install chromium` |
| `npm run sim` | محاكاة التعلّم وبتكتب `tests/results.json` | Node |
| `npm run analytics` | تقرير الأداء على بيانات تجريبية ← `analytics/report/report.html` | Python + Node |
| `npm run test:all` | كل اللي فوق | الكل |

## الطبقات
1. **Unit/Property** (`tests/engine.test.mjs`): قواعد القهوة على ١٥٠٠ استبيان عشوائي.
2. **Learning** (`tests/learning.test.mjs`): التعلّم والوسوم والنص العربي والبدء البارد.
3. **Simulation** (`tests/sim.mjs`): مستخدمين وهميين بذوق مخفي. ممكن تغيّر `makeUser/utility` وتشوف الأثر.
4. **E2E** (`tests/e2e.py`): الواجهة الحقيقية.
5. **Analytics** (`analytics/tests`): التحليل بيكتشف التحسّن الحقيقي ومبيخترعوش.

## تصحيح الأخطاء (Debug)
- افتح Console في المتصفح (F12) واكتب: `S` (حالة الاستبيان)، `me()` (المستخدم والنموذج والتفضيلات)، `DB.log` (الأحداث)، `S.R` (آخر توصية كاملة).
- `recommend(S.ans, me().model, me().prefs)` بيشغّل المحرك بإيدك. `stats(me().model, S.R.x, 0)` بيقولك إيه اللي النموذج متوقعه للخلطة دي.
- «نزّل بياناتي» في صفحة حسابي بيطلّع ملف JSON تقدر تحطه في `python3 -m analytics.report --events hadota-my-data.json`.
- لو اختبار فشل: `node --test --test-reporter=tap tests/engine.test.mjs` بيطبع سبب الفشل بالتفصيل.
- تغيير `engine.js` (ده مصدر الحقيقة المشحون): شغّل `npm test` و`npm run sim` وقارن بالأرقام في `docs/LEARNING.md` قبل ما تدمج.

## ملاحظة أمانة
اختبارات `engine` و`learning` وAnalytics وE2E اتشغّلت فعلاً وعدّت. ملف CI (`.github/workflows/ci.yml`) واتصال Supabase الحقيقي والـ Edge Function **ما اتجرّبوش**.
