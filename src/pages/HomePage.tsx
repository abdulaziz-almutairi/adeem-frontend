import { Link } from 'react-router-dom';
import { Video, CalendarCheck, Bot, Shield, Clock, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative adeem-bg flex items-center justify-center min-h-[90vh] px-6 pt-20">
        <div className="relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-6 border border-brand-100">
            <i className="fas fa-circle-nodes"></i> منصة أديم الطبية المتكاملة
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 text-dark-900">
            استشارة جلدية آمنة <br/>
            <div className='justify-center pt-3'>
                <span className="bg-clip-text text-transparent bg-brand-gradient">أونلاين</span>
            </div>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            أفضل أطباء الجلدية والتجميل بين يديك عبر مكالمة فيديو مشفرة وآمنة. احصل على التشخيص والوصفات الطبية دون الحاجة لزيارة العيادة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="px-8 py-4 bg-brand-gradient text-white font-bold rounded-2xl shadow-xl shadow-brand-500/30 hover:scale-105 transition-transform flex items-center gap-2">
              <CalendarCheck size={20}/> احجز استشارة فيديو
            </Link>
            <Link to="/ai-chat" className="px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl border-2 border-brand-100 hover:border-brand-300 transition-colors shadow-sm flex items-center gap-2">
              <Bot size={20}/> اسأل المساعد الذكي
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-dark-900 mb-12">كيف تحصل على استشارتك الجلدية؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Bot, title: 'استشر الذكاء الاصطناعي', desc: 'صف أعراضك الجلدية واحصل على تقييم أولي فوري' },
              { icon: CalendarCheck, title: 'احجز موعد الفيديو', desc: 'اختر طبيب الجلدية والموعد المناسب لك إلكترونياً' },
              { icon: Video, title: 'تحدث مع طبيبك مباشرة', desc: 'ابدأ مكالمة فيديو خاصة واحصل على الوصفة الطبية' }
            ].map((step, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-md shadow-brand-500/20">
                  <step.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-black text-dark-900 mb-12 text-center">لماذا أديم للجلدية؟</h2>
          <div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex justify-center">
            {[
              { icon: Shield, title: 'خصوصية تامة', desc: 'استشارة سرية 100% من منزلك' },
              { icon: Clock, title: 'متاح 24/7', desc: 'أطباء جلدية متاحون على مدار الساعة' },
              { icon: CreditCard, title: 'دفع آمن', desc: 'ادفع فقط مقابل الاستشارة التي تحصل عليها' }
            ].map((f, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4 hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-xl bg-brand-50 text-brand-600"><f.icon size={24}/></div>
                <div><h4 className="font-bold mb-1">{f.title}</h4><p className="text-sm text-slate-500">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-brand-gradient text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black mb-4">بشرتك تستحق الأفضل</h2>
          <p className="text-white/80 mb-8 text-lg">سجل الآن واحصل على استشارة جلدية مجانية مع مساعدنا الذكي.</p>
          <Link to="/register" className="px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl shadow-xl hover:scale-105 transition-transform">ابدأ مجاناً</Link>
        </div>
      </section>
    </div>
  );
}