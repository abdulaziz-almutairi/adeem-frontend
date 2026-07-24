🩺 أديم (Adeem) - منصة الرعاية الصحية الذكية

منصة طبية متكاملة لربط المرضى بالأطباء عبر استشارات الفيديو والحجز الإلكتروني والذكاء الاصطناعي. الواجهة مبنية بـ React, TypeScript, Tailwind CSS.
🚀 تشغيل المشروع محلياً

    تأكد من وجود Node.js (الإصدار 18 أو أحدث).
    افتح Terminal في مجلد المشروع ونفذ:

npm installnpm run dev

🔌 ربط المشروع مع Backend (API)

تم بناء طبقة اتصال موحدة في الملف src/api/apiService.ts. جميع الطلبات للخادم تمر من خلال هذا الملف باستخدام axios.
خطوات الربط:

    تغيير رابط الخادم:
    افتح ملف src/api/apiService.ts وغير قيمة API_BASE_URL لرابط الباك إند الخاص بك:

typescript
 
  
 
 
const API_BASE_URL = 'https://your-backend-api.com/api'; 
 
 

    إلغاء تعليق (Uncomment) كود الـ API:
    في نفس الملف، ستجد لكل دالة كودين:

     كود مكتوب بشكل طبيعي (هذا هو كود الـ Fetch الحقيقي).
     كود داخل تعليق \// Mock للتجربة فقط.

احذف كود الـ Mock، واستخدم كود الـ axios.

مثال - قبل التعديل (Mock):
typescript
 
  
 
 
export const login = async (email: string, password: string) => {
  // const res = await api.post('/auth/login', { email, password }); <-- الكود الحقيقي معلق
  // return res.data;

  // Mock للتجربة فقط (احذفه)
  return new Promise...
};
 
 

مثال - بعد التعديل (جاهز للإنتاج):
typescript
 
  
 
 
export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};
 
 
🔴 مسارات الباك إند المطلوبة (Endpoints):
الوصف
	
Method
	
Endpoint
تسجيل دخول	POST	/api/auth/login
حساب جديد	POST	/api/auth/register
قائمة الأطباء	GET	/api/doctors?specialty=
حجز موعد	POST	/api/appointments
مواعيد الطبيب	GET	/api/doctors/:id/appointments
دردشة AI	POST	/api/ai/chat
بدء مكالمة فيديو	POST	/api/video/initiate
  
هيكل الـ Response المتوقع من الباك إند للمصادقة:
json
 
  
 
 
{
  "user": {
    "id": "1",
    "name": "د. أحمد",
    "role": "doctor",
    "avatar": "url..."
  },
  "token": "jwt_token_here"
}
 
 
text
 
  
 
 

---

### 💡 ملاحظات تصميمية لـ "أديم":
- استخدمت `bg-brand-gradient` في الأزرار الرئيسية والشعار، وهو تدرج من البنفسجي `#9333ea` إلى الأحمر الداكن `#e11d48` مطابق تماماً لألوان عقدة الشعار.
- أضفت فئة CSS جديدة اسمها `adeem-bg` في ملف `index.css` تقوم بإنشاء أشكال دائرية ضبابية متحركة خلف الصفحة الرئيسية لتعطي تأثير العقد المتداخلة الشفافة الموجودة في صورك.
- أيقونة `fa-circle-nodes` المستخدمة في الشعار تمثل الترابط والعقد، مما يتناسب مع اسم "أديم" ومعنى التشابك والأساس.
 
 
    
     
