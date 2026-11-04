import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { DoctorPublic } from '../../types';

const api = vi.hoisted(() => ({
  getPublicProfile: vi.fn(),
  getMyQualifications: vi.fn(),
  addQualification: vi.fn(),
  deleteQualification: vi.fn(),
  uploadProfilePicture: vi.fn(),
  getPendingQualifications: vi.fn(),
  reviewQualification: vi.fn(),
}));

vi.mock('../../api/doctorApi', () => ({
  doctorApi: {
    getPublicProfile: api.getPublicProfile,
    getMyQualifications: api.getMyQualifications,
    addQualification: api.addQualification,
    deleteQualification: api.deleteQualification,
    uploadProfilePicture: api.uploadProfilePicture,
  },
}));
vi.mock('../../api/adminApi', () => ({
  adminApi: {
    getPendingQualifications: api.getPendingQualifications,
    reviewQualification: api.reviewQualification,
  },
}));

const { default: QualificationsToggle } = await import('./QualificationsToggle');
const { default: MyQualifications } = await import('./MyQualifications');
const { default: ProfilePictureUploader } = await import('./ProfilePictureUploader');
const { default: QualificationReview } = await import('../admin/QualificationReview');
const { default: DoctorProfilePage } = await import('../../pages/doctors/DoctorProfilePage');

const doctor: DoctorPublic = {
  id: 7,
  fullName: 'د. سارة العتيبي',
  specialty: 'الأمراض الجلدية',
  pricePerSession: 92,
  bio: 'خبرة في علاج الأمراض الجلدية المزمنة',
  rank: 'SPECIALIST',
  yearsOfExperience: 9,
  profilePictureUrl: 'https://res.cloudinary.com/demo/sara.jpg',
  doctorQualification: [
    { id: 1, degreeName: 'البورد السعودي', institution: 'الهيئة السعودية للتخصصات الصحية', fieldOfStudy: 'الجلدية', yearObtained: 2019 },
  ],
};

beforeEach(() => {
  Object.values(api).forEach(fn => fn.mockReset());
  vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(cleanup);

describe('QualificationsToggle', () => {
  it('hides qualifications until the patient opens them, and can close them again', () => {
    render(<QualificationsToggle qualifications={doctor.doctorQualification!} />);

    const toggle = screen.getByRole('button', { name: /عرض المؤهلات \(1\)/ });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByText('البورد السعودي')).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('البورد السعودي')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /إخفاء المؤهلات/ }));
    expect(screen.queryByText('البورد السعودي')).toBeNull();
  });

  it('says so when there is nothing approved to show', () => {
    render(<QualificationsToggle qualifications={[]} />);
    expect(screen.getByText('لا توجد مؤهلات معتمدة معروضة بعد')).toBeTruthy();
  });
});

describe('DoctorProfilePage', () => {
  const renderAt = (path: string) => render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/doctors/:doctorId" element={<DoctorProfilePage />} /></Routes>
    </MemoryRouter>,
  );

  it('shows picture, name, professional title and experience, with qualifications collapsed', async () => {
    api.getPublicProfile.mockResolvedValue(doctor);
    renderAt('/doctors/7');

    expect(await screen.findByRole('heading', { name: /د. سارة العتيبي/ })).toBeTruthy();
    expect(api.getPublicProfile).toHaveBeenCalledWith(7);
    expect((screen.getByAltText('صورة د. سارة العتيبي') as HTMLImageElement).src).toBe(doctor.profilePictureUrl);
    expect(screen.getByText(/أخصائي · الأمراض الجلدية/)).toBeTruthy();
    expect(screen.getByText('9 سنوات خبرة')).toBeTruthy();
    expect(screen.getByText(doctor.bio!)).toBeTruthy();
    expect(screen.queryByText('البورد السعودي')).toBeNull();
    expect(screen.getByRole('link', { name: /احجز موعداً/ }).getAttribute('href')).toBe('/booking?doctorId=7');
  });

  it('shows the initial when the doctor has no picture', async () => {
    api.getPublicProfile.mockResolvedValue({ ...doctor, profilePictureUrl: null });
    renderAt('/doctors/7');

    await screen.findByRole('heading', { name: /د. سارة العتيبي/ });
    expect(screen.queryByRole('img', { name: /صورة/ })).toBeNull();
  });

  it('refuses an invalid id without calling the server', async () => {
    renderAt('/doctors/abc');

    expect(await screen.findByText('الطبيب غير موجود')).toBeTruthy();
    expect(api.getPublicProfile).not.toHaveBeenCalled();
  });

  it('shows the server message for an unverified or unknown doctor', async () => {
    api.getPublicProfile.mockRejectedValue({ response: { data: { message: 'الطبيب غير موجود' } } });
    renderAt('/doctors/99');

    expect(await screen.findByText('الطبيب غير موجود')).toBeTruthy();
  });
});

describe('MyQualifications', () => {
  it('lists each qualification with its review status and the rejection reason', async () => {
    api.getMyQualifications.mockResolvedValue([
      { id: 1, degreeName: 'MBBS', institution: 'KSU', status: 'APPROVED' },
      { id: 2, degreeName: 'Diploma', institution: 'X', status: 'REJECTED', rejectionReason: 'أرفق الشهادة' },
      { id: 3, degreeName: 'Board', institution: 'SCFHS', status: 'PENDING' },
    ]);
    render(<MyQualifications doctorProfileId={7} />);

    expect(await screen.findByText('معتمد ويظهر للمرضى')).toBeTruthy();
    expect(screen.getByText('مرفوض')).toBeTruthy();
    expect(screen.getByText('سبب الرفض: أرفق الشهادة')).toBeTruthy();
    expect(screen.getByText('بانتظار المراجعة')).toBeTruthy();
  });

  it('adds a qualification for the doctor profile and reloads the list', async () => {
    api.getMyQualifications.mockResolvedValueOnce([]).mockResolvedValueOnce([
      { id: 4, degreeName: 'MBBS', institution: 'KSU', status: 'PENDING' },
    ]);
    api.addQualification.mockResolvedValue({});
    render(<MyQualifications doctorProfileId={7} />);
    await screen.findByText('لم تضف أي مؤهل بعد');

    fireEvent.change(screen.getByLabelText('الدرجة العلمية *'), { target: { value: 'MBBS' } });
    fireEvent.change(screen.getByLabelText('المؤسسة التعليمية *'), { target: { value: 'KSU' } });
    fireEvent.change(screen.getByLabelText('سنة الحصول عليه'), { target: { value: '2015' } });
    fireEvent.click(screen.getByRole('button', { name: /إضافة مؤهل/ }));

    await waitFor(() => expect(api.addQualification).toHaveBeenCalledWith(7, {
      degreeName: 'MBBS', institution: 'KSU', fieldOfStudy: undefined, yearObtained: 2015,
    }));
    expect(await screen.findByText('بانتظار المراجعة')).toBeTruthy();
  });

  it('deletes after confirmation and shows a server refusal', async () => {
    api.getMyQualifications.mockResolvedValue([{ id: 1, degreeName: 'MBBS', institution: 'KSU', status: 'PENDING' }]);
    api.deleteQualification.mockRejectedValue({ response: { data: { message: 'ليس لديك الصلاحية لحذف هذا المؤهل' } } });
    render(<MyQualifications doctorProfileId={7} />);

    fireEvent.click(await screen.findByRole('button', { name: 'حذف MBBS' }));

    expect(await screen.findByText('ليس لديك الصلاحية لحذف هذا المؤهل')).toBeTruthy();
    expect(api.deleteQualification).toHaveBeenCalledWith(1);
  });
});

describe('ProfilePictureUploader', () => {
  const pick = (file: File) => fireEvent.change(screen.getByLabelText('اختيار صورة شخصية'), { target: { files: [file] } });

  it('uploads a JPEG and refreshes the profile', async () => {
    const onUploaded = vi.fn();
    api.uploadProfilePicture.mockResolvedValue(undefined);
    render(<ProfilePictureUploader name="د. سارة" url={null} onUploaded={onUploaded} />);

    pick(new File(['x'], 'me.jpg', { type: 'image/jpeg' }));

    expect(await screen.findByText('تم تحديث الصورة الشخصية')).toBeTruthy();
    expect(api.uploadProfilePicture).toHaveBeenCalledOnce();
    expect(onUploaded).toHaveBeenCalledOnce();
  });

  it('refuses unsupported types and oversized files before uploading', async () => {
    render(<ProfilePictureUploader name="د. سارة" url={null} onUploaded={vi.fn()} />);

    pick(new File(['x'], 'cv.pdf', { type: 'application/pdf' }));
    expect(await screen.findByText(/نوع الصورة غير مدعوم/)).toBeTruthy();

    const big = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
    pick(big);
    expect(await screen.findByText('حجم الصورة يجب ألا يتجاوز 5MB')).toBeTruthy();

    expect(api.uploadProfilePicture).not.toHaveBeenCalled();
  });
});

describe('QualificationReview (admin)', () => {
  const item = { id: 5, doctorId: 7, doctorName: 'د. سارة', specialty: 'الجلدية', degreeName: 'Board', institution: 'SCFHS', status: 'PENDING' as const };

  it('approves and reloads the queue', async () => {
    api.getPendingQualifications.mockResolvedValueOnce([item]).mockResolvedValueOnce([]);
    api.reviewQualification.mockResolvedValue(undefined);
    render(<QualificationReview />);

    fireEvent.click(await screen.findByRole('button', { name: /اعتماد/ }));

    await waitFor(() => expect(api.reviewQualification).toHaveBeenCalledWith(5, 'APPROVED', undefined));
    expect(await screen.findByText('لا توجد مؤهلات بانتظار المراجعة')).toBeTruthy();
  });

  it('requires a reason before rejecting', async () => {
    api.getPendingQualifications.mockResolvedValue([item]);
    api.reviewQualification.mockResolvedValue(undefined);
    render(<QualificationReview />);

    fireEvent.click(await screen.findByRole('button', { name: /رفض/ }));
    fireEvent.click(screen.getByRole('button', { name: 'تأكيد الرفض' }));
    expect(await screen.findByText('اكتب سبب الرفض ليراه الطبيب')).toBeTruthy();
    expect(api.reviewQualification).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('سبب الرفض (يظهر للطبيب)'), { target: { value: 'أرفق الشهادة' } });
    fireEvent.click(screen.getByRole('button', { name: 'تأكيد الرفض' }));
    await waitFor(() => expect(api.reviewQualification).toHaveBeenCalledWith(5, 'REJECTED', 'أرفق الشهادة'));
  });
});
