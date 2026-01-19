import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import styles from './AuthPage.module.css';

export function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('구글 로그인 처리 중...');

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const stateParam = searchParams.get('state');
    const storedMode = localStorage.getItem('google_oauth_mode');
    const oauthMode = stateParam === 'signup' || storedMode === 'signup' ? 'signup' : 'login';
    localStorage.removeItem('google_oauth_mode');

    if (errorParam) {
      setError('구글 로그인이 취소되었습니다.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!code) {
      setError('인증 코드가 없습니다.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const handleGoogleLogin = async () => {
      try {
        setStatus('구글 로그인 처리 중...');
        const tokenResponse = await authApi.googleLogin({ code, mode: oauthMode });

        // 토큰 저장
        localStorage.setItem('access_token', tokenResponse.access_token);

        // 사용자 정보 가져오기
        setStatus('사용자 정보를 가져오는 중...');
        const user = await usersApi.getMe();
        queryClient.clear();
        setAuth(tokenResponse.access_token, user);

        setStatus('로그인 완료! 메인 페이지로 이동합니다...');
        setTimeout(() => navigate('/settlements'), 2000);
      } catch (err: any) {
        console.error('Google login error:', err);
        setError(err.message || '구글 로그인에 실패했습니다.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleGoogleLogin();
  }, [searchParams, navigate, setAuth]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoText}>비키니시티 정산소</div>
        </div>

        <h1 className={styles.title}>구글 로그인</h1>

        {error ? (
          <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
        ) : (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem' }}>⏳</div>
              <div>{status}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleCallbackPage;
