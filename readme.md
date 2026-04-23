
    
TRƯỜNG ĐẠI HỌC THUỶ LỢI 
KHOA CÔNG NGHỆ THÔNG TIN

BẢN TÓM TẮT ĐỀ CƯƠNG ĐỒ ÁN TỐT NGHIỆP

Tên đề tài : Xây dựng hệ thống bán mỹ phẩm trực tuyến tích hợp gợi ý sản phẩm cá nhân hóa 

    Sinh viên thực hiện: Nguyễn Xuân Hoàng 

Lớp: 64HTTT3

Mã sinh viên: 2251162016	

Số điện thoại: 0764783777

Email: 2251162016@e.tlu.edu.vn

Giáo viên hướng dẫn: TS.Đỗ Oanh Cường 

Email : cuongdo@e.tlu.edu.vn
TÓM TẮT ĐỀ TÀI 
Trong bối cảnh chuyển đổi mạnh mẽ, thương mại điện tử ngành mỹ phẩm không chỉ dừng lại ở việc giao dịch trực tuyến mà còn tiến tới cuộc đua về trải nghiệm cá nhân hóa. Tuy nhiên, nhiều doanh nghiệp vừa và nhỏ hiện nay vẫn gặp khó khăn trong công việc quản trị vận hành và chưa khai thác hiệu quả dữ liệu khách hàng để tối ưu doanh số.
Đề tài tập trung xây dựng Hệ thống bán mỹ phẩm trực tuyến tích hợp ý tưởng sản phẩm cá nhân hóa . Hệ thống không chỉ đáp ứng đầy đủ các dịch vụ thương mại điện tử cốt lõi (Quản lý giỏ hàng, đặt hàng, thanh toán) mà vẫn được chuẩn hóa quy trình quản trị thông tin qua các mô-đun: Quản lý tồn kho  thông minh, thiết lập chiến dịch khuyến mãi linh hoạt và Bảng điều khiển báo cáo doanh thu theo thời gian thực.
Điểm nhấn của hệ thống là ứng dụng Trí tuệ nhân tạo (AI) thông qua mô hình mẹo (Hệ thống khuyến nghị). Bằng cách phân tích nhu cầu khách hàng đề hệ thống tự động đưa ra các sản phẩm phù hợp nhất theo nhu cầu riêng của từng khách hàng. Điều này không chỉ nâng cao trải nghiệm người dùng mà còn là công cụ chiến lược giúp doanh nghiệp tối ưu hóa tỷ lệ chuyển đổi và tăng trưởng doanh thu bền vững.


CÁC MỤC TIÊU CHÍNH

- Cá nhân hóa: Tích hợp module gợi ý sản phẩm dựa trên nhu cầu khách hàng 
-  Chuẩn hóa quản trị: Xây dựng phần hệ quản trị chuyên nghiệp giúp quản lý sản phẩm, kiểm soát tồn kho và thiết lập các chiến dịch khuyến mãi linh hoạt.
-  Đánh giá hoạt động: Theo dõi và báo cáo sự thay đổi về doanh thu và tỷ lệ chuyển đổi khi áp dụng tính năng gợi ý thông minh.
- Hoàn thiện nền tảng kỹ thuật: Đảm bảo hệ thống vận hành ổn định trên kiến trúc hiện đại, có khả năng mở rộng và bảo mật thông tin người dùng theo tiêu chuẩn thương mại điện tử.
CHI TIẾT KỸ THUẬT – SẢN PHẨM 
-	Hệ thống kiến trúc 
●	Hệ thống được xây dựng theo kiến trúc MVC (Frontend và Backend) kết hợp với Micro-services nhẹ cho module AI.
●	Giao tiếp: Sử dụng RESTful API để trao đổi dữ liệu giữa các thành phần.
-	Công nghệ sử dụng 
●	Frontend:NextJS, Tailwind CSS để tối ưu hóa UI/UX giao diện.
●	Backend chính:  Java SpringBoot xử lý các nghiệp vụ quản lý sản phẩm, tồn tại kho và đơn hàng, xử lý đăng ký / đăng nhập bằng Jwt .
●	Module AI (Gợi ý): Python (FastAPI).
+ Sử dụng API để xây dưng chatbot gợi ý sản phẩm dựa trên nhu cầu người mua 
●	Cơ sở dữ liệu: PostGreSQL (Thiết kế chuẩn hóa 3NF để đảm bảo tính nhất quán dữ liệu tồn tại).
-	Sản phẩm 
●	Phần mềm :
          + Hoàn thiện Mã nguồn của Website và Module AI.
+ Hệ thống quản trị Admin Dashboard: Quản lý danh mục, thiết lập mã giảm giá (Coupon), biểu đồ thống kê doanh thu theo thời gian thực hiện.
●	Tài liệu phân tích /thiết kế :
+ Sơ đồ nghiệp vụ chuẩn BPMN (Quy trình đặt hàng & xử lý đơn).
+ Sơ đồ lớp (Class Diagram) và Sơ đồ thực thể quan hệ (ERD).
+ API đặc tả Tài liệu (Tài liệu Swagger/Postman).


- Chỉ số đánh giá sản phẩm 
●	Khả năng tính toán: Hệ thống hoạt động ổn định trên phổ biến trình duyệt  
●	Hiệu năng: Thời gian phản hồi của các cốt lõi chức năng tốt 


KẾT QUẢ DỰ KIẾN

1. Về sản phẩm phần mềm:
●	Người dùng hệ thống trang web: Hoàn thiện đầy đủ quy trình mua sắm từ Đăng ký, Tìm kiếm thông minh, Giỏ hàng đến Đặt hàng và Theo dõi trạng thái đơn hàng.
●	Module Cá nhân hóa: Tích hợp thành công hệ thống AI gợi ý sản phẩm 
●	Hệ quản trị (Bảng điều khiển dành cho quản trị viên): Xây dựng bộ công cụ quản trị chuẩn hóa:
o	Quản lý danh mục mỹ phẩm và thuộc tính sản phẩm 
o	Quản lý kho hàng (nhập/xuất/tồn).
o	Thiết lập các chương trình khuyến mãi 
●	Báo cáo & Thống kê: Hệ thống biểu đồ trực quan về doanh thu, sản phẩm bán chạy và tỷ lệ chuyển đổi khi ứng dụng AI.
2. Về kỹ thuật và dữ liệu:
●	Mô hình AI: Hệ thống gợi ý chuẩn xác 
●	Kiến trúc: Hệ thống hoạt động ổn định, API phản hồi tốc độ nhanh , giao diện tương thích tốt trên  máy tính
●	An toàn dữ liệu: Đảm bảo bảo mật thông tin người dùng và phân quyền rõ ràng giữa khách hàng , người quản lý.
3. Về tài liệu và học thuật:
●	Hoàn thiện bản đồ báo cáo báo cáo với đầy đủ các phân tích sơ đồ: BPMN (quy trình nghiệp vụ), Use Case, Class Diagram, ERD (Cơ sở dữ liệu chuẩn hóa).
●	Cách sử dụng hướng dẫn tài liệu và API đặc tả tài liệu.


TIẾN ĐỘ THỰC HIỆN	


TT	Thời gian	Nội dung công việc	Kết quả đạt được
1	Tuần 1-2 	- Chốt phạm vi đề tài, tính năng chi tiết. 

- Khảo sát nghiệp vụ bán hàng và quản trị mỹ phẩm thực tế.
    Hoàn thành tài liệu đặc tả yêu cầu và phạm vi đồ án.
2	Tuần 3-4 	- Thiết kế hệ thống tổng thể (ERD, Use Case, BPMN)	Bộ sơ đồ thiết kế hệ thống chi tiết.
3	Tuần 5-8 	- Thiết lập Backend (API), Frontend giao diện người dùng.

- Hoàn thiện các module: Đăng ký/Đăng nhập, Giỏ hàng, Đặt hàng.
    Hoàn thành luồng mua sắm cơ bản cho người dùng
4	Tuần 9 - 11	Chuẩn hóa module quản trị & AI:
- Xây dựng Admin Dashboard: Quản lý sản phẩm, tồn kho, khuyến mãi .

- Xây dựng Module AI 	Hoàn thiện trang quản trị và module gợi ý sản phẩm cá nhân hóa.
5	Tuần 12 - 13	- Tích hợp AI vào hệ thống chính. 
- Kiểm thử (Testing) toàn bộ chức năng. 
- Sửa lỗi và tối ưu hiệu năng API.	Hệ thống vận hành ổn định
6	Tuần 14	- Hoàn thiện báo cáo bản cứng, làm trình chiếu (Slide) 
- Chuẩn bị bảo vệ trước hội đồng.	Đồ án hoàn chỉnh và hồ sơ bảo vệ sẵn sàng.


TÀI LIỆU THAM KHẢO
1.	https://oanhcuongdo.com/ 
2.	Phân tích và thiết kế hệ thống thông tin , Nhà xuất bản Đại học Quốc gia Hà Nội
3.	Tài liệu tham khảo API Node.js : https://nodejs.org/fr 
4.	Bộ dữ liệu Kaggle , Lịch sử sự kiện thương mại điện tử trong Cửa hàng mỹ phẩm :    https://www.kaggle.com/datasets/mkechinov/ecommerce-events-history-in-cosmetics-shop




BÁO CÁO TUẦN 3-4 : 

1. Giới thiệu chung
Trong giai đoạn đầu của đề án, công việc chủ yếu tập trung vào khảo sát nghiệp vụ bán hàng thực tế, xác định phạm vi đề tài và xây dựng bộ yêu cầu hệ thống.Đây là bước nền tảng để định hình cấu trúc hợp nhất MVC cho các dịch vụ vi mô cho mô-đun AI sau đây.
Mục tiêu của giai đoạn này là:
•	Xác định nhu cầu cá nhân hóa trong thương mại điện tử chuyên ngành mỹ phẩm.
•	Phân tích các khó khăn trong quản trị vận hành (ton kho, khuyến mãi) của doanh nghiệp vừa và nhỏ.
•	Xây dựng bộ chức năng yêu cầu (mua sắm, quản trị, mẹo AI) và yêu cầu chức năng (hiệu ứng, bảo mật).
•	Tích hợp danh sách công nghệ sử dụng: NextJS, Java SpringBoot, Python (FastAPI) và PostgreSQL.
2. Nội dung thực hiện
2.1. Khảo sát hiện trạng và nghiệp vụ thực tế
Tiến hành khảo sát các phương thức kinh doanh sản phẩm mỹ phẩm hiện nay và nhận thấy một số hạn chế:
•	Trải nghiệm khách hàng: Người dùng khó lựa chọn sản phẩm phù hợp với đặc thù cá nhân (loại da, nhu cầu riêng) giữa hàng hóa mặt hàng.
•	Quản trị vận hành: Nhiều hệ thống chưa tối ưu được kiểm soát tồn tại thông minh và thiết lập chiến dịch khuyến mãi linh hoạt.
•	Khai thác dữ liệu: Chưa ứng dụng hiệu quả trí tuệ nhân tạo để tăng tỷ lệ chuyển đổi và tính bền vững của doanh nghiệp.
Từ đó, xác định nhu cầu xây dựng hệ thống cần có:
•	Tích hợp module tip ý sản phẩm dựa trên nhu cầu khách hàng (AI Personalization).
•	Chuẩn hóa bộ công cụ quản trị Quản trị viên chuyên nghiệp (Kho hàng, Coupon, Dashboard).
2.2.Hệ thống yêu cầu phân tích
2.2.1 Yêu cầu chức năng 
A. Phân hệ người dùng (Khách hàng):
•	Quản lý tài khoản: Đăng ký, đăng nhập và xác thực bằng Jwt.
•	Mua sắm trực tuyến: Tìm kiếm sản phẩm thông minh, quản lý giỏ hàng, đặt hàng và theo dõi đơn hàng.
•	Cá nhân hóa (Trọng tâm): Tích hợp Chatbot hoặc Module AI để tự động đưa ra các sản phẩm phù hợp nhất theo nhu cầu riêng của từng khách hàng.
B. Phân hệ quản trị (Bảng điều khiển dành cho quản trị viên):
•	Quản lý sản phẩm: Quản lý danh mục, thuộc tính mỹ phẩm (loại da, thương hiệu).
•	Quản lý vận hành: Kiểm soát kho hàng (nhập/xuất/tồn) và thiết lập mã giảm giá (Coupon) linh hoạt.
•	Báo cáo & Thống kê: Theo dõi doanh thu, sản phẩm bán ra và mẹo hiệu quả AI qua biểu đồ thời gian thực.
2.2.2 . Yêu cầu phi chức năng 
•	Hiệu suất (Hiệu suất): Đảm bảo API phản hồi tốc độ nhanh và tính toán ổn định trên trình duyệt máy tính.
•	Bảo mật (Bảo mật): Sử dụng Jwt để xác thực và phân quyền rõ ràng giữa khách hàng và người quản lý.
•	Tính nhất quán (Độ tin cậy): Cơ sở dữ liệu PostgreSQL thiết kế chuẩn hóa 3NF để đảm bảo an toàn và tối thiểu quản lý dữ liệu tồn tại.
•	Khả năng mở rộng (Scalability): Kiến trúc Micro-services nhẹ nhàng cho module AI giúp dễ dàng nâng cấp mô hình mũi ý.
2.3. Thiết kế tổng quan hệ thống 
2.3.1. Sơ đồ Use Case Tổng quát  (UML) 

 

Tác nhân (Actors):
•	Khách hàng : Thực hiện các nghiệp vụ mua sắm cốt lõi.
•	Quản trị viên : Hệ thống điều hành, quản lý hàng hóa và theo dõi hiệu quả kinh doanh.
•	Module AI : Đóng vai trò là một hệ thống hỗ trợ (Tác nhân phụ) cung cấp mẹo dữ liệu và tỷ lệ chuyển đổi phân tích.

2.3.2. UC Dặt hàng & Thanh toán  
2.3.3. UC Quản lý sản phẩm
 
2.3.4. Kiến trúc hệ thống 
 A . Mô hình kiến trúc Tổng quan

Hệ thống được xây dựng theo kiến trúc MVC (Model-View-Controller) cho cốt lõi nghiệp vụ, kết hợp với Micro-services nhẹ dành riêng cho module AI.
•	Frontend (Giao diện người dùng): Sử dụng NextJS và Tailwind CSS để tối ưu hóa trải nghiệm UI/UX và tốc độ tải trang.
•	Backend main: Sử dụng Java SpringBoot để xử lý các nghiệp vụ quản lý sản phẩm, tồn kho, đơn hàng và bảo mật hệ thống.
•	Module AI (Gợi ý cá nhân hóa): Sử dụng Python (FastAPI) để xây dựng chatbot và hệ thống khuyến nghị sản phẩm.
B. Thành phần kỹ thuật và công nghệ
Clearsystem được xác định rõ ràng để đảm bảo khả năng mở rộng và bảo mật:
Thành phần	Công nghệ ứng dụng	Vai trò chính
Giao diện	NextJS, Tailwind CSS	Hiển thị trang web mua sắm và quản trị Dashboard.
Nghiệp vụ chính	Java SpringBoot	Xử lý logic đặt hàng, thanh toán và quản trị tồn tại.
xác thực	JWT (Json Web Token)	Quản lý đăng nhập và phân quyền bảo mật người dùng/quản trị viên.
Trí tuệ nhân tạo	Python, FastAPI	Phân tích nhu cầu khách hàng để đưa ra mẹo ý sản phẩm.
Sở hữu dữ liệu	PostgreSQL	Lưu trữ dữ liệu chuẩn hóa 3NF để đảm bảo tính nhất quán.
Giao tiếp	API RESTful	Trao đổi dữ liệu giữa Frontend, Backend và Module AI.

C. Luồng hoạt động 
Kiến trúc này được đảm bảo phân phối nhịp nhàng giữa các thành phần:
1.	Phía Khách hàng : Người dùng tương tác với giao diện NextJS, gửi yêu cầu qua RESTful API đến Backend SpringBoot.
2.	Xử lý AI: Khi có yêu cầu mẹo, Backend hoặc Frontend sẽ gọi đến Module AI (Python).Mô-đun này phân tích hành vi và trả về danh sách sản phẩm phù hợp nhất.
3.	Quản trị: Quản trị viên tương tác với Dashboard để cập nhật kho hàng, thiết lập phiếu giảm giá.Mọi thay đổi được lưu trực tiếp vào PostgreSQL qua SpringBoot.
4.	Báo cáo: Hệ thống tổng hợp dữ liệu từ PostgreSQL để hiển thị biểu đồ thu nhập và tỷ lệ chuyển đổi theo thời gian thực hiện.
2.4. Biểu đồ hoạt động 
2.4.1. Biểu đồ hoạt động – Đăng ký /Đăng nhập 
   
2.4.2. Biểu đồ hoạt động – Tìm kiếm sản phẩm 
 
2.4.3. Biểu đồ hoạt động – Quản lý giỏ hàng  
2.4.4. Biểu đồ hoạt động – Đặt hàng & Thanh toán 
 
2.4.5. Biểu đồ hoạt động – Nhận gợi ý sản phẩm cá nhân hóa
  

2.4.6. Biểu đồ hoạt động – Quản lý sản phẩm và danh mục
 
2.4.7. Biểu đồ hoạt động – Quản lý tồn kho 
 
2.4.8. Biểu đồ hoạt động – Thiết lập khuyến mãi
 
2.4.9. Biểu đồ hoạt động – Xem báo cáo doanh thu & AI 
 
2.5. BIỂU ĐỒ TUẦN TỰ 
2.5.1 .Biều đồ tuần tự - Đăng ký/Đăng nhập 
 
2.5.2 Biều đồ tuần tự - Tìm kiếm sản phẩm
 
2.5.3 Biều đồ tuần tự - Quản lý giỏ hàng  
2.5.4 Biều đồ tuần tự - Đặt hàng và thanh toán  
2.5.5 Biều đồ tuần tự - Nhận gợi ý sản phẩm  
2.5.6 Biều đồ tuần tự - Quản lý sản phẩm & Danh mục  
2.5.7 Biều đồ tuần tự - Quản lý tồn kho  
2.5.8 Biều đồ tuần tự - Thiết lập khuyến mãi  
2.5.9 Biều đồ tuần tự - Báo cáo doanh thu & AI 


2.6.Biều đồ thực thể ERD 

 
Danh sách các thực thể chính
- NGUOI_DUNG (Người dùng): Lưu trữ thông tin định danh của khách hàng và quản trị viên. Bao gồm họ tên, email (dùng làm tài khoản đăng nhập), mật khẩu đã mã hóa và vai trò (Admin hoặc Khách hàng).
- SAN_PHAM (Sản phẩm): Lưu trữ thông tin chi tiết về các loại mỹ phẩm. Đặc biệt có trường loai_da (Skin Type) – đây là dữ liệu đầu vào quan trọng để module AI thực hiện gợi ý chính xác.
- DANH_MUC (Danh mục): Phân loại sản phẩm (ví dụ: Chăm sóc da, Trang điểm, Chăm sóc tóc) giúp người dùng dễ dàng tìm kiếm.
- DON_HANG (Đơn hàng): Lưu thông tin tổng quát của một giao dịch bao gồm người mua, tổng tiền và trạng thái đơn hàng (Chờ xử lý, Đang giao, Hoàn thành).
- CHI_TIET_DON_HANG (Chi tiết đơn hàng): Thực thể trung gian lưu danh sách các sản phẩm trong một đơn hàng, số lượng mua và giá bán tại thời điểm đó.
- TON_KHO (Tồn kho): Quản lý số lượng hàng còn lại trong kho cho từng sản phẩm cụ thể để đảm bảo hệ thống không bán quá số lượng thực tế.
- KHUYEN_MAI (Khuyến mại): Lưu trữ các mã giảm giá (Coupon), phần trăm chiết khấu và thời hạn áp dụng.
- GOI_Y_AI (Gợi ý AI): Lưu trữ kết quả phân tích từ Module AI. Thực thể này liên kết người dùng với các sản phẩm được đề xuất dựa trên điểm tương thích (score).
Mô tả các mối quan hệ (Relationships)
-	Người dùng - Đơn hàng (1:N): Một người dùng có thể đặt nhiều đơn hàng khác nhau, nhưng mỗi đơn hàng chỉ thuộc về một người dùng duy nhất.
-	Sản phẩm - Danh mục (N:1): Nhiều sản phẩm có thể thuộc cùng một danh mục (ví dụ: nhiều loại son cùng thuộc danh mục "Trang điểm").
-	Đơn hàng - Chi tiết đơn hàng (1:N): Một đơn hàng bao gồm nhiều dòng chi tiết sản phẩm. Mối quan hệ này giúp quản lý giỏ hàng và lịch sử mua sắm.
-	Sản phẩm - Tồn kho (1:1): Mỗi sản phẩm sẽ có một bản ghi tương ứng trong bảng tồn kho để quản lý số lượng nhập/xuất.
-	Đơn hàng - Khuyến mại (N:0..1): Một đơn hàng có thể áp dụng tối đa một mã giảm giá hoặc không áp dụng mã nào.
-	Gợi ý AI - Người dùng & Sản phẩm: Đây là mối quan hệ kết nối giữa hành vi người dùng và dữ liệu sản phẩm, cho phép hệ thống hiển thị danh sách "Sản phẩm dành riêng cho bạn".
2.7. SƠ ĐỒ NGHIỆP VỤ 
2.7.1 . Sơ đồ nghiệp vụ = Quản lý đặt hàng  
2.7.2. Sơ đồ nghiệp vụ - Nhận gợi ý sản phẩm  
2.7.3. Sơ đồ nghiệp vụ - Quản lý tồn kho   
2.8. BIỂU ĐỒ LỚP  
Các lớp chính : 
•	User (Người dùng): Chứa thông tin tài khoản và phân quyền (Admin/Customer).
•	Product (Sản phẩm): Chứa thông tin mỹ phẩm, lưu ý thuộc tính skinType để phục vụ Module AI.
•	Order & OrderDetail: Mô tả đơn hàng và các dòng sản phẩm chi tiết trong đơn hàng đó.
•	Inventory (Tồn kho): Gắn liền với Sản phẩm để quản lý số lượng nhập/xuất.
•	AI_Recommendation: Lưu trữ kết quả phân tích từ Module AI dành cho từng User.
Mối quan hệ :
•	Composition (Thành phần - Hình thoi đặc): Giữa Order và OrderDetail. Nghĩa là nếu xóa Đơn hàng thì các Chi tiết đơn hàng đó cũng bị xóa theo.
•	Aggregation (Tập hợp): Giữa Product và Category. Sản phẩm thuộc về Danh mục, nhưng nếu xóa Danh mục thì Sản phẩm vẫn có thể tồn tại (hoặc chuyển sang danh mục khác).
•	Multiplicity (Bội số):
o	1 -- 0..*: Một người dùng có thể có nhiều đơn hàng hoặc không có đơn nào.
o	1 -- 1: Một sản phẩm chỉ có một bản ghi tồn kho tương ứng.
 