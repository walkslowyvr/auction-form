'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

type Step = 1 | 2 | 3;

interface FormData {
    name: string;
    phone: string;
    case_year: string;    // 연도 (예: 2024)
    case_seq: string;     // 번호 (예: 12345)
    property_number: string;
    inquiry: string;
    agreed: boolean;
}

const INITIAL_DATA: FormData = {
    name: '',
    phone: '',
    case_year: '',
    case_seq: '',
    property_number: '',
    inquiry: '',
    agreed: false,
};

const brokerName = process.env.NEXT_PUBLIC_BROKER_NAME || '담당 공인중개사';
const brokerOffice = process.env.NEXT_PUBLIC_BROKER_OFFICE || '경매대행 서비스';
const brokerPhone = process.env.NEXT_PUBLIC_BROKER_PHONE || '';

export default function InquiryForm() {
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const update = (field: keyof FormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
    };

    const canProceedStep1 = formData.name.trim() && formData.phone.replace(/\D/g, '').length >= 10;
    const fullCaseNumber = `${formData.case_year.trim()}타경${formData.case_seq.trim()}`;
    const canProceedStep2 = formData.case_year.trim().length === 4 && formData.case_seq.trim().length >= 1;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const { error: sbError } = await getSupabase().from('leads').insert({
                name: formData.name.trim(),
                phone: formData.phone,
                case_number: fullCaseNumber,
                property_number: formData.property_number.trim() || null,
                inquiry: formData.inquiry.trim() || null,
            });
            if (sbError) throw sbError;
            setIsSuccess(true);
        } catch {
            setError('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return <SuccessScreen brokerName={brokerName} brokerPhone={brokerPhone} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 flex flex-col">
            {/* Header */}
            <header className="px-5 pt-10 pb-6 text-center">
                <p className="text-blue-300 text-sm font-medium tracking-wide mb-1">{brokerOffice}</p>
                <h1 className="text-white text-2xl font-bold leading-tight">
                    경매 물건 분석 의뢰서
                </h1>
                <p className="text-blue-200 text-sm mt-2">
                    사건번호를 알려주시면 권리분석 결과를 빠르게 안내해 드립니다
                </p>
            </header>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 px-5 mb-6">
                {([1, 2, 3] as const).map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step === s
                            ? 'bg-white text-blue-900 shadow-lg scale-110'
                            : step > s
                                ? 'bg-blue-400 text-white'
                                : 'bg-blue-800 text-blue-400'
                            }`}>
                            {step > s ? '✓' : s}
                        </div>
                        {s < 3 && <div className={`w-10 h-0.5 transition-all duration-300 ${step > s ? 'bg-blue-400' : 'bg-blue-800'}`} />}
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-10 mb-8 text-xs">
                <span className={step >= 1 ? 'text-blue-200' : 'text-blue-600'}>기본 정보</span>
                <span className={step >= 2 ? 'text-blue-200' : 'text-blue-600'}>사건 정보</span>
                <span className={step >= 3 ? 'text-blue-200' : 'text-blue-600'}>동의 및 제출</span>
            </div>

            {/* Form Card */}
            <div className="flex-1 bg-white rounded-t-3xl px-5 pt-8 pb-10 shadow-2xl form-card">
                {step === 1 && (
                    <div>
                        <h2 className="text-gray-800 text-xl font-bold mb-1">기본 정보 입력</h2>
                        <p className="text-gray-400 text-sm mb-6">연락 가능한 정보를 입력해 주세요</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="홍길동"
                                    value={formData.name}
                                    onChange={update('name')}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 transition-all duration-200 text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    연락처 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="010-0000-0000"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 transition-all duration-200 text-base"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!canProceedStep1}
                            className="w-full mt-8 bg-blue-900 text-white py-4 rounded-xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-200"
                        >
                            다음 단계 →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-gray-800 text-xl font-bold mb-1">사건 정보 입력</h2>
                        <p className="text-gray-400 text-sm mb-6">분석을 의뢰할 물건 정보를 입력해 주세요</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    사건번호 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="2024"
                                        value={formData.case_year}
                                        onChange={(e) => setFormData(prev => ({ ...prev, case_year: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                        className="w-24 border border-gray-200 rounded-xl px-3 py-3.5 text-gray-800 placeholder-gray-300 text-base text-center"
                                    />
                                    <span className="text-gray-700 font-bold text-base px-1 whitespace-nowrap bg-gray-100 rounded-lg px-3 py-3.5">타경</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        placeholder="12345"
                                        value={formData.case_seq}
                                        onChange={(e) => setFormData(prev => ({ ...prev, case_seq: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                        className="flex-1 border border-gray-200 rounded-xl px-3 py-3.5 text-gray-800 placeholder-gray-300 text-base"
                                    />
                                </div>
                                <p className="text-gray-400 text-xs mt-1.5 ml-1">
                                    입찰표 또는 법원 경매 공고에서 확인하실 수 있습니다
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    물건번호
                                    <span className="ml-1.5 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">선택</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="예) 1, 2, 3 (여러 물건일 때만 입력)"
                                    value={formData.property_number}
                                    onChange={update('property_number')}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 transition-all duration-200 text-base"
                                />
                                <p className="text-gray-400 text-xs mt-1.5 ml-1">
                                    같은 사건번호에 물건이 여러 개인 경우에만 입력하세요
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    문의사항
                                    <span className="ml-1.5 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">선택</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="궁금하신 점을 자유롭게 작성해 주세요"
                                    value={formData.inquiry}
                                    onChange={update('inquiry')}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-300 transition-all duration-200 text-base resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 border-2 border-gray-200 text-gray-500 py-4 rounded-xl font-bold text-base active:scale-[0.98] transition-all duration-200"
                            >
                                ← 이전
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!canProceedStep2}
                                className="flex-[2] bg-blue-900 text-white py-4 rounded-xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-200"
                            >
                                다음 단계 →
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-gray-800 text-xl font-bold mb-1">동의 및 최종 제출</h2>
                        <p className="text-gray-400 text-sm mb-6">입력하신 내용을 확인해 주세요</p>

                        {/* 입력 내용 요약 */}
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2.5">
                            <SummaryRow label="이름" value={formData.name} />
                            <SummaryRow label="연락처" value={formData.phone} />
                            <SummaryRow label="사건번호" value={fullCaseNumber} />
                            {formData.property_number && (
                                <SummaryRow label="물건번호" value={formData.property_number} />
                            )}
                            {formData.inquiry && (
                                <SummaryRow label="문의사항" value={formData.inquiry} />
                            )}
                        </div>

                        {/* 면책 고지 */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-800 leading-relaxed">
                            <p className="font-bold mb-1">⚠️ 안내 사항</p>
                            본 분석은 1차 요약 데이터로 법적 효력이 없으며, 최종 입찰 전 반드시 대면 상담을 진행해야 합니다.
                        </div>

                        {/* 개인정보 동의 */}
                        <label className="flex items-start gap-3 cursor-pointer mb-5">
                            <input
                                type="checkbox"
                                checked={formData.agreed}
                                onChange={(e) => setFormData(prev => ({ ...prev, agreed: e.target.checked }))}
                                className="mt-0.5 w-5 h-5 accent-blue-900 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-600 leading-relaxed">
                                <strong className="text-gray-800">개인정보 수집 및 이용에 동의합니다.</strong>
                                <br />
                                <span className="text-gray-400 text-xs">
                                    수집 항목: 이름, 연락처 | 목적: 경매 물건 분석 및 결과 안내 | 보유: 서비스 완료 후 1년
                                </span>
                            </span>
                        </label>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4 text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 border-2 border-gray-200 text-gray-500 py-4 rounded-xl font-bold text-base active:scale-[0.98] transition-all duration-200"
                            >
                                ← 이전
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.agreed || isSubmitting}
                                className="flex-[2] bg-blue-900 text-white py-4 rounded-xl font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-200"
                            >
                                {isSubmitting ? '제출 중...' : '의뢰 접수하기 ✓'}
                            </button>
                        </div>

                        {brokerPhone && (
                            <p className="text-center text-xs text-gray-400 mt-4">
                                문의: <a href={`tel:${brokerPhone}`} className="text-blue-600 font-medium">{brokerPhone}</a>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start text-sm">
            <span className="text-gray-400 w-20 flex-shrink-0">{label}</span>
            <span className="text-gray-800 font-medium text-right flex-1">{value}</span>
        </div>
    );
}

function SuccessScreen({ brokerName, brokerPhone }: { brokerName: string; brokerPhone: string }) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 flex flex-col items-center justify-center px-5 text-center">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-gray-800 text-2xl font-bold mb-2">의뢰가 접수되었습니다!</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    전문가가 권리분석 후 <strong className="text-blue-900">입력하신 연락처로 빠르게 안내</strong>해 드리겠습니다.
                    <br /><br />
                    <span className="text-xs text-gray-400">※ 분석 결과 발송까지 통상 수분~수십분이 소요될 수 있습니다.</span>
                </p>
                {brokerPhone && (
                    <a
                        href={`tel:${brokerPhone}`}
                        className="block w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-base"
                    >
                        📞 {brokerName}에게 직접 전화하기
                    </a>
                )}
                <p className="text-xs text-gray-300 mt-4">
                    본 서비스는 법적 조언이 아닌 정보 제공 목적입니다
                </p>
            </div>
        </div>
    );
}
