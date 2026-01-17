import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import styles from './AuthPage.module.css';

const completeProfileSchema = z
  .object({
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
    paymentMethod: z.enum(['kakaopay', 'toss', 'bank'], {
      invalid_type_error: '희망 입금 방식을 선택해주세요',
    }),
    paymentAccount: z.string().optional(),
  })
  .refine((data) => (data.paymentMethod === 'bank' ? !!data.paymentAccount : true), {
    message: '계좌이체 선택 시 계좌번호를 입력해주세요',
    path: ['paymentAccount'],
  });

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

export function GoogleCompleteProfilePage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      paymentMethod: 'kakaopay',
    },
  });

  const watchPaymentMethod = watch('paymentMethod');

  const completeProfileMutation = useMutation({
    mutationFn: async (data: CompleteProfileFormData) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('로그인 정보가 없습니다. 다시 로그인해주세요.');
      }

      await authApi.completeGoogleProfile({
        name: data.name,
        payment_method: data.paymentMethod,
        payment_account: data.paymentAccount || '',
      });

      const user = await usersApi.getMe();
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate('/settlements');
    },
    onError: (err: Error) => {
      setError(err.message || '프로필 완성에 실패했습니다.');
    },
  });

  const onSubmit = (data: CompleteProfileFormData) => {
    setError(null);
    completeProfileMutation.mutate(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💸</div>
          <div className={styles.logoText}>Dutch Pay</div>
        </div>

        <h1 className={styles.title}>추가 정보 입력</h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
          구글 로그인을 환영합니다! 추가 정보를 입력해주세요.
        </p>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              이름
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="홍길동"
              {...register('name')}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>희망 입금 방식</label>
            <select
              {...register('paymentMethod')}
              className={`${styles.input} ${errors.paymentMethod ? styles.inputError : ''}`}
            >
              <option value="kakaopay">카카오페이</option>
              <option value="toss">토스</option>
              <option value="bank">계좌이체 (직접 입력)</option>
            </select>
            {errors.paymentMethod && (
              <span className={styles.errorText}>{errors.paymentMethod.message}</span>
            )}
          </div>

          {watchPaymentMethod === 'bank' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="paymentAccount">
                계좌번호 (은행명 포함)
              </label>
              <input
                id="paymentAccount"
                type="text"
                className={`${styles.input} ${errors.paymentAccount ? styles.inputError : ''}`}
                placeholder="예: 신한은행 110-123-456789"
                {...register('paymentAccount')}
              />
              {errors.paymentAccount && (
                <span className={styles.errorText}>{errors.paymentAccount.message}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            style={{ backgroundColor: '#4f46e5', marginTop: '1rem' }}
            disabled={completeProfileMutation.isPending}
          >
            {completeProfileMutation.isPending ? '완료 중...' : '완료'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default GoogleCompleteProfilePage;
