import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';
import { Payment } from '../../types';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

export default function PaymentPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!appointmentId) return;
    paymentApi.initiatePayment(Number(appointmentId))
      .then(setPayment)
      .catch((err) => setError(err.response?.data?.message || 'تعذّر بدء عملية الدفع'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleConfirm = async () => {
    if (!payment) return;
    setConfirming(true);
    setError('');
    try {
      await paymentApi.confirmPayment(payment.transactionReference);
      setConfirmed(true);
      setTimeout(() => navigate('/patient/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذّر تأكيد الدفع، حاول مرة أخرى');
    } finally {
      setConfirming(false);
    }
  };

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
