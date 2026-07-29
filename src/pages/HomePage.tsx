import { Link } from 'react-router-dom';
import { Video, CalendarCheck, Bot, Shield, Clock, CreditCard, ArrowLeft, Sparkles } from 'lucide-react';
import heroMark from '../assets/logo-mark.png';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-brand-50/60 via-white to-white px-6 py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1 text-center lg:text-right">
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black leading-[1.2] pt-3 mb-4 pb-6 text-brand-600">
              أديم
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-900 mb-6">
              لأن العناية الذكية تبدأ من هنا
            </p>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0">
              منصة متكاملة تجمع بين أطباء الجلدية والمساعد الذكي لتمنحك تجربة دقيقة، سريعة، وآمنة.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link to="/booking" className="px-9 py-5 text-lg bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:scale-105 transition-all flex items-center gap-3">
                ابدأ الآن <ArrowLeft size={22}/>
              </Link>
            </div>
          </div>

          {/* Mark */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <img src={heroMark} alt="شعار أديم" className="w-72 sm:w-96 lg:w-[28rem] h-auto animate-mark-float drop-shadow-2xl" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-56 h-10 bg-dark-900/10 blur-2xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-dark-900 mb-12">كيف تحصل على استشارتك ؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Bot, title: 'استشر الذكاء الاصطناعي', desc: 'صف أعراضك الجلدية واحصل على تقييم أولي فوري' },
              { icon: CalendarCheck, title: 'احجز موعد الفيديو', desc: 'اختر طبيب الجلدية والموعد المناسب لك إلكترونياً' },
              { icon: Video, title: 'تحدث مع طبيبك مباشرة', desc: 'ابدأ مكالمة فيديو خاصة واحصل على الوصفة الطبية' }
            ].map((step, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 hover:bg-white transition-all">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-md shadow-brand-500/20">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'خصوصية تامة', desc: 'استشارة سرية وخاصة من منزلك' },
              { icon: Clock, title: 'متاح 24/7', desc: 'أطباء جلدية متاحون على مدار الساعة' },
              { icon: CreditCard, title: 'دفع آمن', desc: 'ادفع فقط مقابل الاستشارة التي تحصل عليها' }
            ].map((f, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-start gap-4 hover:shadow-lg hover:-translate-y-1 hover:border-brand-100 transition-all">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20"><f.icon size={22}/></div>
                <div><h4 className="font-bold mb-1">{f.title}</h4><p className="text-sm text-slate-500">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-brand-gradient text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-10"></div>
        <div className="absolute w-72 h-72 rounded-full bg-white/10 blur-3xl -top-24 -right-24" />
        <div className="absolute w-72 h-72 rounded-full bg-black/10 blur-3xl -bottom-24 -left-24" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-white/15 border border-white/20 flex items-center justify-center mb-5">
            <Sparkles size={20} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-3">بشرتك تستحق الأفضل</h2>
          <p className="text-white/80 mb-8 text-sm sm:text-base max-w-lg mx-auto">سجل الآن واحصل على استشارة جلدية مجانية مع مساعدنا الذكي.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm bg-white text-brand-700 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 hover:bg-brand-50 transition-all"
          >
            ابدأ مجاناً <ArrowLeft size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}