# Greetbuy Product Saver (Chrome Extension)

Tiện ích Chrome giúp bạn lưu thông tin sản phẩm từ `greetbuy.com` về máy cục bộ (Chrome Storage Local).

## Tính năng

- Lưu thông tin sản phẩm tại trang `https://www.greetbuy.com/goods/*`.
- Lưu dữ liệu cục bộ trên máy đã cài tiện ích.
- Danh sách sản phẩm đã lưu hiển thị ngay trong popup.
- Mỗi sản phẩm có:
  - Ảnh đại diện
  - Tên sản phẩm
  - Giá (nếu lấy được)
  - Nút mở trang chi tiết trong extension
  - Nút mở lại trang gốc greetbuy

## Cài đặt thủ công

1. Mở `chrome://extensions`.
2. Bật **Developer mode**.
3. Chọn **Load unpacked**.
4. Chọn thư mục dự án này.

## Cách dùng

1. Mở trang sản phẩm, ví dụ:  
   `https://www.greetbuy.com/goods/taobao?id=920797232015`
2. Bấm icon extension → **Lưu sản phẩm hiện tại**.
3. Sản phẩm được lưu vào bộ nhớ local của Chrome trên máy của bạn.
4. Từ popup, bấm **Mở chi tiết** để xem thông tin đã lưu hoặc **Mở nguồn** để quay lại trang gốc.

## Ghi chú

- Do mỗi website có cấu trúc HTML khác nhau theo thời điểm, extension sẽ cố gắng lấy dữ liệu theo nhiều selector phổ biến và có thể chưa đầy đủ 100% mọi trường hợp.
- Dữ liệu không đồng bộ lên server, chỉ lưu local ở trình duyệt/máy cài tiện ích.
