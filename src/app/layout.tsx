import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
});

export const metadata: Metadata = {
  title: `경매 물건 분석 의뢰 | ${process.env.NEXT_PUBLIC_BROKER_OFFICE || '경매 대행 서비스'}`,
  description: '부동산 경매 물건 분석을 빠르고 정확하게 받아보세요. 사건번호를 입력하시면 전문가가 권리분석 결과를 신속하게 안내해드립니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased bg-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
