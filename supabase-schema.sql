-- =====================================================
-- 경매 대행 AI 자비서 - Supabase 테이블 스키마
-- =====================================================
-- Supabase 대시보드 > SQL Editor에서 이 스크립트를 실행하세요.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- 고객 기본 정보
  name text not null,
  phone text not null,

  -- 사건 정보
  case_number text not null,       -- 사건번호 (예: 2025타경12345)
  property_number text,            -- 물건번호 (선택, 복수 물건일 경우)
  inquiry text,                    -- 문의사항

  -- 처리 상태
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'done', 'error', 'waiting_info'))
);

-- 인덱스 (폴링 성능 최적화)
create index if not exists leads_status_created_at_idx on leads (status, created_at);

-- RLS (Row Level Security) - anon key는 INSERT만 허용
alter table leads enable row level security;

create policy "allow anon insert" on leads
  for insert
  to anon
  with check (true);

-- 관리자(service_role)는 모든 권한
create policy "allow service role all" on leads
  for all
  to service_role
  using (true);
