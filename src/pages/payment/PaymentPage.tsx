import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';
import { Payment } from '../../types';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { apiErrorMessage } from '../../utils/apiError';

// رقم الموعد يجب أن يكون عدداً صحيحاً موجباً - الرابط /payment/abc لا يرسل أي طلب (QA-010)
function parseAppointmentId(value?: string) {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export default function PaymentPage() {
  const { appointmentId: appointmentIdParam } = useParams();
  const navigate = useNavigate();
  const appointmentId = parseAppointmentId(appointmentIdParam);
  const pendingInitiate = useRef<{ appointmentId: number; request: Promise<Payment> } | null>(null);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (appointmentId === null) return;
    let active = true;
    // StrictMode يشغّل هذا التأثير مرتين في بيئة التطوير، فنعيد استخدام الطلب الجاري بدل إرسال POST ثانٍ (FE-08)
    if (pendingInitiate.current?.appointmentId !== appointmentId) {
      pendingInitiate.current = { appointmentId, request: paymentApi.initiatePayment(appointmentId) };
    }
    pendingInitiate.current.request
      .then((result) => {
        if (!active) return;
        setPayment(result);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'تعذّر بدء عملية الدفع');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [appointmentId]);

  const handleConfirm = async () => {
    if (!payment) return;
    setConfirming(true);
    setError('');
    try {
      await paymentApi.confirmPayment(payment.transactionReference);
      setConfirmed(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err) {
      setError(apiErrorMessage(err, 'تعذّر تأكيد الدفع، حاول مرة أخرى'));
    } finally {
      setConfirming(false);
    }
  };

  if (appointmentId === null) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 adeem-bg flex items-start justify-center">
        <div className="relative z-10 bg-white rounded-2xl p-8 shadow-xl border border-slate-100 max-w-md w-full text-center">
          <Alert variant="danger" className="mb-4">رابط الدفع غير صالح. افتح صفحة الدفع من مواعيدك في لوحة التحكم</Alert>
          <Button onClick={() => navigate('/patient/dashboard')} size="lg" className="w-full">
            العودة إلى لوحة التحكم
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 adeem-bg flex items-start justify-center">
      <div className="relative z-10 bg-white rounded-2xl p-8 shadow-xl border border-slate-100 max-w-md w-full text-center">
        {confirmed ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-success-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="text-success-500" size={28} />
            </div>
            <h2 className="text-xl font-bold mb-2">تم تأكيد الدفع بنجاح</h2>
            <p className="text-slate-500 text-sm">جاري تحويلك إلى لوحة التحكم...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <CreditCard className="text-brand-600" size={28} />
            </div>
            <h2 className="text-xl font-bold mb-1">إتمام الدفع</h2>
            <p className="text-slate-400 text-xs mb-6">وضع تجريبي - بانتظار تفعيل بوابة الدفع الرسمية</p>

            {payment && (
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-right space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">المبلغ</span><span className="font-bold">{payment.amount} ر.س</span></div>
                <div className="flex justify-between gap-3 text-sm"><span className="text-slate-500 shrink-0">المرجع</span><span className="font-mono text-xs break-all" dir="ltr">{payment.transactionReference}</span></div>
              </div>
            )}

            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

            <Button onClick={handleConfirm} disabled={!payment} loading={confirming} size="lg" className="w-full">
              {confirming ? 'جاري التأكيد...' : 'تأكيد الدفع (وضع تجريبي)'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
