import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// Key lưu trong localStorage
const STORAGE_KEY = 'xpiano_affiliate_ref';

// Thời hạn cookie giới thiệu: 30 ngày (tính bằng milliseconds)
const EXPIRY_DAYS = 30;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// ============================================================
// Các hàm tiện ích - export để dùng ở khắp nơi
// ============================================================

/**
 * Lưu mã giới thiệu vào localStorage kèm expiry timestamp
 */
export function saveAffiliateRef(code: string): void {
    const payload = {
        code: code.trim().toUpperCase(),
        expiry: Date.now() + EXPIRY_MS  // Hết hạn sau 30 ngày
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    console.log(`✅ Affiliate ref saved: ${payload.code} (expires in ${EXPIRY_DAYS} days)`);
}

/**
 * Đọc mã giới thiệu từ localStorage.
 * Tự động xóa nếu đã hết hạn.
 * @returns mã giới thiệu nếu còn hạn, null nếu không có hoặc hết hạn
 */
export function getAffiliateRef(): string | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const payload = JSON.parse(raw) as { code: string; expiry: number };

        // Kiểm tra hạn sử dụng
        if (!payload.expiry || Date.now() > payload.expiry) {
            localStorage.removeItem(STORAGE_KEY);
            console.log('⚠️ Affiliate ref expired, removed from localStorage');
            return null;
        }

        return payload.code;
    } catch {
        // JSON parse lỗi → xóa dữ liệu hỏng
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

/**
 * Xóa thủ công mã giới thiệu (sau khi đã dùng xong / đơn hàng hoàn thành)
 */
export function clearAffiliateRef(): void {
    localStorage.removeItem(STORAGE_KEY);
}

// ============================================================
// Custom Hook: useAffiliateTracking
// Dùng ở component gốc (App hoặc Layout) để luôn bắt ?ref= từ URL
// ============================================================
export function useAffiliateTracking(): void {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const refCode = searchParams.get('ref');

        if (refCode && refCode.trim().length > 0) {
            // Có mã ref trong URL → lưu vào localStorage
            // Ghi đè nếu đã có mã cũ (mã mới được ưu tiên)
            saveAffiliateRef(refCode);
        } else {
            // Không có ref trong URL → kiểm tra và dọn dẹp nếu đã hết hạn
            getAffiliateRef(); // Hàm này tự xóa nếu expired
        }
    }, [searchParams]);
}

export default useAffiliateTracking;
