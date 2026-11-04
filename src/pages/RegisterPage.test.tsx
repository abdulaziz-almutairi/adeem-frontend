import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const registerDoctor = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ registerPatient: vi.fn(), registerDoctor }),
}));

const { default: RegisterPage } = await import('./RegisterPage');

afterEach(cleanup);

// FE-02 / QA-004: the doctor form sends exactly what DoctorRegisterDTO requires, and no price.
describe('RegisterPage doctor sign-up', () => {
  it('sends first, second and last name, rank and experience, and no price', async () => {
    registerDoctor.mockResolvedValue(undefined);
    render(<MemoryRouter><RegisterPage /></MemoryRouter>);

    fireEvent.click(screen.getByDisplayValue('DOCTOR'));
    fireEvent.change(screen.getByLabelText('الاسم الأول'), { target: { value: 'سارة' } });
    fireEvent.change(screen.getByLabelText('اسم الأب'), { target: { value: 'محمد' } });
    fireEvent.change(screen.getByLabelText('اسم العائلة'), { target: { value: 'العتيبي' } });
    fireEvent.change(screen.getByPlaceholderText('example@email.com'), { target: { value: 'sara@test.local' } });
    fireEvent.change(screen.getByPlaceholderText('8 أحرف على الأقل'), { target: { value: 'Password-1' } });
    fireEvent.change(screen.getByPlaceholderText('أمراض جلدية وتجميل'), { target: { value: 'الجلدية' } });
    fireEvent.change(screen.getByLabelText('المسمى المهني'), { target: { value: 'SPECIALIST' } });
    fireEvent.change(screen.getByLabelText('سنوات الخبرة'), { target: { value: '9' } });
    fireEvent.change(screen.getByPlaceholderText('MOH-XXXXX'), { target: { value: 'MOH-123' } });
    expect(screen.queryByText(/سعر الجلسة \(ر.س\)/)).toBeNull();

    fireEvent.submit(screen.getByRole('button', { name: /إنشاء الحساب/ }).closest('form')!);

    await waitFor(() => expect(registerDoctor).toHaveBeenCalledOnce());
    const sent = registerDoctor.mock.calls[0][0];
    expect(sent).toMatchObject({
      firstName: 'سارة', secondName: 'محمد', lastName: 'العتيبي', email: 'sara@test.local',
      specialty: 'الجلدية', rank: 'SPECIALIST', experiance: 9, licenseNumber: 'MOH-123',
    });
    expect(sent).not.toHaveProperty('pricePerSession');
    expect(sent).not.toHaveProperty('fullName');
  });
});
