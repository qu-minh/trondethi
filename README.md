# Website Trộn Đề Thi Trắc Nghiệm Online Dành Cho Giáo Viên (TronDeOnline)

Hệ thống trộn đề thi trắc nghiệm trực tuyến dành cho giáo viên với giao diện thuần tiếng Việt, thân thiện, bảo mật và bảo toàn 100% độ chính xác của đáp án.

---

## 🌟 Tính Năng Nổi Bật

1. **Xử lý an toàn 100% trên trình duyệt (Client-side Processing)**:
   - File đề thi của giáo viên không bao giờ được gửi lên máy chủ hay internet, đảm bảo tuyệt đối tính bảo mật của đề thi.
2. **Quy trình 6 bước rõ ràng & trực quan**:
   - `1. Hướng dẫn & Tải mẫu` ➔ `2. Tải đề lên` ➔ `3. Kiểm tra đề gốc` ➔ `4. Cấu hình trộn` ➔ `5. Review đề trộn` ➔ `6. Xác nhận & Tải xuống`.
3. **Hiển thị trực tiếp đề gốc**:
   - Cho phép xem từng câu hỏi, kiểm tra phương án nhận diện và đáp án đúng.
   - Hỗ trợ chỉnh sửa trực tiếp nội dung câu hỏi, bổ sung đáp án thiếu, xóa hoặc thêm câu hỏi mới.
4. **Tự động phát hiện tham chiếu đặc biệt (Reference Warning)**:
   - Phát hiện các phương án như *"A và C đều đúng"*, *"Cả A, B và C"*, *"Tất cả đều sai"*.
   - Đưa ra cảnh báo nổi bật và nút **"Khóa đáp án tất cả câu này"** chỉ với 1 cú click để tránh làm lệch nghĩa khi xáo trộn.
5. **Cơ chế Khóa linh hoạt**:
   - **Khóa vị trí câu hỏi**: Giữ nguyên số thứ tự câu trong bài thi (ví dụ: các câu đọc hiểu đoạn văn, các câu mở đầu).
   - **Khóa trộn phương án**: Giữ nguyên thứ tự A, B, C, D của câu hỏi.
6. **Thuật toán trộn kiểm tra toàn vẹn 100%**:
   - Hoán vị Fisher-Yates kết hợp Seed ngẫu nhiên có thể tái lập.
   - Tự động map chữ cái đáp án mới khớp chính xác với nội dung đáp án gốc.
   - Tự động assert tính toàn vẹn từng câu hỏi trước khi xuất kết quả.
7. **3 Chế độ Review đề sau khi trộn**:
   - **Chế độ Xem đề học sinh**: Ẩn mọi dấu hiệu đáp án, chuẩn format in bài thi.
   - **Chế độ Xem kèm đáp án**: Nổi bật đáp án đúng, hiển thị mã đề và ma trận đáp án nhanh.
   - **Chế độ Đối chiếu đề gốc**: So sánh chi tiết từng câu (ví dụ: *Câu 1 mã 101 tương ứng Câu 4 đề gốc, đáp án đổi từ B sang C*).
8. **Xuất file đa dạng và chuẩn format Bộ GD&ĐT**:
   - **Tải trọn bộ (.ZIP)**: Chứa toàn bộ file Word từng mã đề + Bảng Excel đáp án + File Word đáp án.
   - **Tải file Word (.docx) từng mã đề**: Đầy đủ tiêu đề trường, khối, môn, thời gian, khung tên & SBD học sinh.
   - **Tải bảng tổng hợp đáp án (.xlsx)**: 2 trang tính (Ma trận đối chiếu câu hỏi & Bảng chấm OMR).
   - **Tải file Word đáp án (.docx)**: Bảng kẻ ô chuẩn mực in dán bảng tin.
   - **Đề kèm đáp án ở cuối (.docx)**: Dành cho hồ sơ chuyên môn lưu trữ.

---

## 📋 Định Dạng File Hỗ Trợ

### Định dạng 1: File Word thông thường
Giáo viên soạn thảo bình thường theo mẫu quen thuộc:
```text
Câu 1. Thủ đô của Việt Nam là gì?
A. Hà Nội
B. Đà Nẵng
C. Huế
D. Cần Thơ
Đáp án: A

Câu 2. Trong các phát biểu sau, phát biểu nào đúng?
A. Mệnh đề 1 đúng
B. Mệnh đề 2 đúng
C. Mệnh đề 3 đúng
D. A và C đều đúng
Đáp án: D
```

### Định dạng 2: Định dạng chuẩn thẻ `[MIX:...]` (Khuyên dùng)
```text
[MIX:Q]
Câu 1. Thủ đô của Việt Nam là gì?
[MIX:A] Hà Nội
[MIX:B] Đà Nẵng
[MIX:C] Huế
[MIX:D] Cần Thơ
[MIX:KEY] A
[MIX:END]
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trên Windows

### Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (phiên bản 18+ trở lên, khuyến nghị Node.js v20 hoặc v22).
- Trình duyệt web hiện đại: Chrome, Edge, Cốc Cốc, Firefox.

### Các bước thực hiện:

1. **Mở terminal PowerShell tại thư mục dự án**:
   ```powershell
   cd d:\works\projects\trondeonline
   ```

2. **Cài đặt các gói phụ thuộc (nếu chưa cài)**:
   ```powershell
   npm install
   ```

3. **Khởi chạy máy chủ phát triển (Development Server)**:
   ```powershell
   npm run dev
   ```
   Sau đó mở trình duyệt truy cập: `http://localhost:5173/`

4. **Đóng gói dự án để triển khai (Production Build)**:
   ```powershell
   npm run build
   ```
   Thư mục `dist/` tạo ra có thể triển khai lên Vercel, Netlify, Cloudflare Pages hoặc máy chủ nội bộ trường học.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend Core**: React 19, TypeScript
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS với bảng màu Giáo dục trang nhã, typography Be Vietnam Pro & Inter
- **Xử lý file Word**: `mammoth` (đọc & phân tích .docx trong browser), `docx` (tạo file .docx chuẩn Bộ GD&ĐT)
- **Xử lý file Excel**: `xlsx` (SheetJS)
- **Đóng gói & Tải về**: `jszip`, `file-saver`
- **Bộ icon trực quan**: `lucide-react`
