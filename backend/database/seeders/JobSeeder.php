<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('jobs')->insert([
            [
                'id' => 1,
                'employer_id' => 5,
                'jtype_id' => 1,
                'jlevel_id' => 4,
                'jname' => 'Project Manager',
                'address' => 'Số 6 Quang Trung, phường Trần Hưng Đạo, Quận Hoàn Kiếm, Thành phố Hà Nội',
                'amount' => 5,
                'min_salary' => null,
                'max_salary' => null,
                'yoe' => 8,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Job Purpose

                - The job holder leads portfolio management by providing support in planning, coordination of financial objectives and deliverables for the portfolio of both traditional projects/initiatives implemented through Waterfall methodology and customer journey digitization initiatives implemented through Agile methodology.

                - The job holder collaborates with cross-functional teams within the Transformation Office and other divisions in the bank to ensure operational consistency across bank-wide initiatives in tracking and governing progress, managing resources and communicating with stakeholders.

                Key Accountabilities (1)

                A. Operations Support and Governance

                - Design the operational process across the initiative lifecycle to ensure standartized approach across all type of initiatives/projects.

                - Update operational processes on a regular basis and facilitate the set up of new initiatives and tribes in accordance with required standards.

                - Support the development of tools/templates and guide initiative teams on how to fill in and update initiative progress on the tools/templates created.

                - Apply and maintain tools/templates used to track and report across the portfolio of transformation initiatives (Foundational and Agile), define monitoring tools/templates and customize as needed.

                - Provide logistics support for Head of IPMO and the team, CEO workshops, governance meetings, and be the contact point for building the Agile working environment for the Transformation Office.

                - Consolidate and prepare progress reports for STEERCO, TECO, BOM, BOD leadership committees timely and accurately.

                Key Accountabilities (2)

                B. Resource Management

                - Collaborate with stakeholders in Business Units / Divisions to identify high level resource planning requirements to ensure optimal resource utilization.

                - Track and control resource usage efficiency to ensure sufficiency for all units in the Transformation Office and for bank-wide initiatives within approved plan.

                Key Accountabilities (3)

                C. Portfolio Management

                - Work with transformation initiative leads and teams to understand progress of their assigned portfolio and track the accuracy of inputs for tools.

                - Work with initiative leads to change initiative status and solve problems as required, report key challenges, track progress, recognize financial values and manage use of monitoring tools.

                - Proactively guide initiative teams, Business Units and Divisions for effective cross-functional collaboration.

                - Control quality and compliance of initiatives with required standards.

                - Escalate issues or risks of potential impact on performance via portfolio reporting to Sponsors / STEERCO / TECO committees to facilitate the decision making process.

                - Support the iPMO Lead in developing Early Warning System (EWS).

                YÊU CẦU CÔNG VIỆC
                Success Profile - Qualification and Experiences

                -  At least 8 years of project or program management experience in Waterfall or Agile methodologies

                -  Project or program management experience in a bank or technology organization including banking product development, performance management, IT project implementation

                -  Demonstrated experience working in a transformation office to drive a large organization-wide transformation program

                -  Strong experience in performance tracking and management including operating rhythm of performance reviews

                -  Strong knowledge and experience in blending traditional project management principles and practices with an Agile development approach in the right proportions to fit large, complex, mission-critical, enterprise-level projects

                -  Bachelor’s or Master\'s degree in Technology, Business, Banking and Finance or relevant discipline

                -  Project management certification in PMP, PgMP will be advantageous'),
                'expire_at' => '2023-08-31',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-20 09:05:00'
            ],
            [
                'id' => 2,
                'employer_id' => 5,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Digital Customer Experience Advisor',
                'amount' => 5,
                'address' => 'Số 23 Lê Duẩn, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
                'min_salary' => 14,
                'max_salary' => 17,
                'yoe' => null,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Responsibilities include but are not limited to:
                - Advise customers on financial services (bond, fund, stock and TCBS particular products).
                - Build and implement campaigns (loyalty, minigames…) to have a flexible approach to customer needs.
                - Analyze, propose, implement and optimize the customer journey
                - Handle and solve all customer requests, complains via phones, livechat, facebook, face to face ...
                - Create and maintain the knowledge base on TCBS website, iWealth Club (video, infographic, gif, story...)
                - Research customer pain points and propose innovative solutions, translating and teaching AI chatbot
                - Generate related power BI reports

                YÊU CẦU CÔNG VIỆC
                - University degree or above at top 1 Vietnam University (foreign trade, banking, economics).
                - IT savvy (Python, Power BI, Data Analyst...), design motion graphics, infographic, create video.
                - Ielts above 6.0.
                - Patience and problem-solving ability.
                - Customer-oriented attitude.
                - Outstanding communication skills.'),
                'expire_at' => '2023-08-20',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-19 09:05:00'
            ],
            [
                'id' => 3,
                'employer_id' => 5,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'HCM - Senior Angular Developer',
                'address' => 'Số 23 Lê Duẩn, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
                'amount' => 5,
                'min_salary' => null,
                'max_salary' => null,
                'yoe' => 5,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Responsibilities:

                A. Software Development

                - Drive and deliver top quality HTML, CSS, JQuery and JavaScript user interface code on a wide range of interactive web projects.

                -Work closely with UX researchers and UI designers on designing high quality apps.

                - Own the UI code of the digital platform and the architecture of the user experience, leading designers to take the wireframe from development to delivery.

                - Collaborate with back-end developers to troubleshoot and resolve coding issues, improving usability.

                - Ensure that all materials produced are of high quality, accuracy, timeliness and compliance with accessibility standards.

                - Maintain graphic and branding standards throughout the product\'s look and feel.

                - Actively test and debug the program to ensure stability and accuracy.

                - Develop and maintain user interface code to improve forecasting methods and statistical and analytical models to assist business tribes in their decision making.

                - Build interfaces and user interfaces for the bank\'s digital platforms, ensuring a seamless digital interface from the customer\'s point of view.

                - Responsible for the user-facing code of the digital platform and the architecture of the user experience, working closely with the designers to take the wireframe from development to delivery

                - Collaborate with back end developers and UI/UX designers to improve usability.

                - Proactively give suggestions and systematized solutions to influence the design of the platform.

                - Responsible for defining the structure and design of web pages, striking a balance between functional and aesthetic design, and ensuring the web design is optimized for mobile pages.

                - Maintain and constantly improve the developed website and optimize the application for smooth use of the application.

                B. Software Documentation

                - Instruct tribe and team members to translate business requirements into technical design documents.

                - Actively review and foster discussions with team members on functional requirements documents to build and improve TCB\'s digital products"

                - Work closely with tribe and squad members to translate business requirements into technical design documents.

                - Review and execute requirements documents by coding flowcharts, layouts, diagrams, charts, code annotations, and instructions for the program."

                YÊU CẦU CÔNG VIỆC
                Requirements:

                - Bachelor\'s Degree in Computer Science, Software Engineering or Information Technology

                Work Experience

                - At least 5 years of front-end experience developing in HTML/CSS/JavaScript and Angular 8+

                - Experience with tools that leverage UI/UX design and implementation such as Bootstrap

                - Experience working in a source control environment such as GIT or TFVC

                - Experience in the full development lifecycle from requirements analysis through coding and release

                - Deep experience in developing, testing, documenting, and releasing critical software

                - Solid understanding of API design and implementation

                - Experience with Adobe tools, such as Adobe CS, Adobe Illustrator, Adobe Target, etc, is a big plus

                - Good at English is a plus'),
                'expire_at' => '2023-08-21',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-20 09:05:00'
            ],
            [
                'id' => 4,
                'employer_id' => 8,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Nhân viên thiết kế UIUX (Designer)',
                'address' => 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội',
                'amount' => 5,
                'min_salary' => 15,
                'max_salary' => 25,
                'yoe' => 3,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                1. Tư vấn, tham mưu cho BGĐ TT CNTT về công tác thiết kế đồ họa UX/UI trong phần mềm

                - Nghiên cứu các phương pháp, tiêu chuẩn thiết kế đồ họa mới trên thế giới, áp dụng vào hệ thống các phần mềm tại Tổng Công ty

                .2. Thiết kế đồ họa UX/UI các sản phẩm phần mềm

                Tư vấn, làm rõ các yêu cầu thiết kế đồ họa
                Thực hiện thiết kế đồ họa
                Phối hợp với nhóm phát triển sản phẩm đưa thiết kế vào sản phẩm
                Phối hợp nghiệm thu sản phẩm
                YÊU CẦU CÔNG VIỆC
                Tốt nghiệp đại học trở lên ưu tiên chuyên ngành Thiết kế mỹ thuật hoặc thiết kế đồ họa
                 Tối thiểu 02 năm kinh nghiệm trở lên làm việc trong lĩnh vực thiết kế đồ họa cho phần mềm
                Ưu tiên: Có kinh nghiệm trong thiết kế đồ họa UI/UX các ứng dụng mobile, web có nhiều người sử dụng
                Kiến thức về bố cục, nguyên tắc cơ bản đồ họa, kiểu chữ, in ấn và web
                 Có kiến thức sâu về HTML và CSS
                 Kiến thức sâu về Adobe PhotoShop, Illustrator, Sketch, InDesign và các phần mềm thiết kế đồ họa khác
                Danh mục sản phẩm đã thiết kế có chất lượng cao
                QUYỀN LỢI:

                Quyền lợi

                Gói phụ cấp 48 triệu hàng năm, có phụ cấp ăn trưa điện thoại: 930.000/tháng.
                Ăn trưa ngay tại công ty
                Làm việc từ T2-T6 và ngày T7 đầu tiên của tháng.
                Được ký hợp đồng lao động và tham gia các loại bảo hiểm theo quy định của Nhà nước.
                Được đào tạo tại công ty hoặc tham gia các khóa đào tạo nâng cao, bổ ích bên ngoài.
                Cơ hội tham gia nhiều hoạt động văn hóa, thể dục, thể thao, giải trí.
                Chính sách du lịch, nghỉ dưỡng, khám sức khỏe định kỳ cho CBNV.'),
                'expire_at' => '2023-08-22',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-19 09:05:00'
            ],
            [
                'id' => 5,
                'employer_id' => 8,
                'jtype_id' => 1,
                'jlevel_id' => 3,
                'jname' => 'Technical Leader',
                'address' => 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội',
                'amount' => 5,
                'min_salary' => 32,
                'max_salary' => 60,
                'yoe' => 5,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                • Quản lý tiến độ làm việc của toàn bộ dự án.

                • Trực tiếp tham gia vào quá trình lập trình phần mềm, tham gia sửa và hoàn thiên, nâng cao chất lượng lập trình (70%)
                • Phối hợp với các đơn vị nghiệp vụ, báo cáo về tình hình dự án lên các trưởng/phó phòng quản lý trực tiếp, đề xuất các phương án để dự án chạy thông suốt, đảm bảo chất lượng dự án.

                • Lập kế hoạch phát triển dự án, quản trị rủi ro, phân chia công việc, chịu trách nhiệm về dự án trước các đơn vị nghiệp vụ và các hoạt động của dự án.
                • Thực hiện quản trị dự án, quản lý đầu việc, tiến độ, trạng thái, khối lượng và hiệu suất thực hiện dự án, đánh giá/nhận xét năng lực của thành viên trong dự án.
                • Nghiên cứu, nghiệm thu và đề xuất thay đổi quy trình sản xuất phần mềm (nếu có).

                YÊU CẦU CÔNG VIỆC
                • Tốt nghiệp Đại học về chuyên ngành CNTT, Kỹ thuật phần mềm, An toàn thông tin hoặc các ngành có liên quan. Đặc biệt ưu tiên các trường Đại học Bách Khoa, Học viện Công nghệ Bưu chính Viễn thông, Đại học FPT, Đại học Công nghệ - Đại học Quốc gia Hà Nội và các đại học trường top về CNTT.
                • Có kinh nghiệm ít nhất 02 năm ở vị trí Technical Leader (chính về Java). Ưu tiên các ứng viên có chứng chỉ liên quan tới công nghệ thông tin.
                • Ưu tiên có kinh nghiệm quản trị các dự án theo nhiều mô hình khác nhau như Agile, Waterfall, PMI.
                • Thành thạo các công cụ quản trị dự án và kiểm soát rủi ro

                • Bắt buộc: Thành thạo ngôn ngữ lập trình Java và có hiêu biết một chút về các ngôn ngữ khác.

                • Có kiến thức và kinh nghiệm về Solution Architect và Technical Leader
                • Tư duy logic và tích cực, khả năng giao tiếp tốt, sáng tạo trong công việc

                Quyền lợi

                Thời gian làm việc: 8h00- 17h30 từ thứ 2 tới thứ 6 và một ngày thứ 7 đầu tiên của tháng.
                Địa điểm làm việc: 219 Trung Kính, Cầu Giấy, Hà Nội.
                -  Có phụ cấp ăn trưa điện thoại

                - Gói phụ cấp hàng năm tổng 48 triệu/năm

                -  Được ký hợp đồng lao động và tham gia các loại bảo hiểm theo quy định của Nhà nước.

                -  Được đào tạo tại công ty hoặc tham gia các khóa đào tạo nâng cao, bổ ích bên ngoài.

                -  Cơ hội tham gia nhiều hoạt động văn hóa, thể dục, thể thao, giải trí.

                -  Chính sách du lịch, nghỉ dưỡng, khám sức khỏe định kỳ cho CBNV.'),
                'expire_at' => '2023-08-20',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-15 09:05:00'
            ],
            [
                'id' => 6,
                'employer_id' => 8,
                'jtype_id' => 1,
                'jlevel_id' => 3,
                'jname' => 'Trưởng nhóm lập trình java',
                'address' => 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội',
                'amount' => 5,
                'min_salary' => 25,
                'max_salary' => 40,
                'yoe' => 4,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                - Lập trình trong các dự án phần mềm sử dụng ngôn ngữ Java trong tổng công ty, bao gồm các sản phẩm phục vụ quản lý điều hành kinh doanh, quản lý bán hàng, chăm sóc khách hàng và quản trị doanh nghiệp (ERP)

                - Thiết kế tổng thể, thiết kế chi tiết (màn hình, api, cơ sở dữ liệu, luồng dữ liệu...) các module chức năng của phần mềm để đảm bảo các tiêu chức năng và phi chức năng (như đáp ứng hiệu năng, tính mở rộng..)

                - Chịu trách nhiệm triển khai và hỗ trợ sau triển khai các phần mềm. Xử lý phản ánh người dùng cuối và sửa các lỗi về tính năng, hiệu năng, kiến trúc của phần mềm.

                - Quản lý nhóm lập trình của một hoặc nhiều sản phẩm, chịu trách nhiệm giao việc, quản lý tiến độ chất lượng công việc của nhóm, báo cáo lên trưởng phòng hoặc ban giám đốc trung tâm. Đào tạo để nâng cap chất lượng nhóm. Nghiên cứu và phát triển công nghệ mới giúp tăng hiệu suất cho dự án.

                YÊU CẦU CÔNG VIỆC
                - Tốt nghiệp Đại học trở lên chuyên ngành Công nghệ thông tin, hệ thống thông tin, Khoa học máy hoặc ngành liên quan;

                - Có từ 2 năm kinh nghiệm trở lên với các nền tảng và framework công nghệ Java.

                - Nắm vững các kiến thức cơ bản về lập trình hướng đối tượng, lập trình Java core (multithreading, Collection...)  /Java web (J2EE, ORM, Caching...)

                - Có kinh nghiệm thành thạo sử dụng một trong các framework/stack về java đang triển khai tại TCT như sau:

                - Framework: Spring-boot, Spring MVC, Angular, Các web framework java phổ biến khác

                - Midware: Kafka, Redis, CEP, BPMN engine...

                - Cơ sở dữ liệu: Oracle, Postgresql, MariaDB, NoSQL

                - CI/CD devops: Gitlab, Jenkins,

                Ưu tiên

                - Ứng viên đã có kinh nghiệm tại vị trí tương đương tại các công ty phần mềm lớn (outsourcing hoặc Product)

                - Tham gia các dự án opensource lớn với vai trò contributor.

                - Có chứng chỉ về Java hoặc các framework/platform công nghệ Java.

                - Độ tuổi: Dưới 32

                QUYỀN LỢI:

                - Lương tháng : Upto 40.000.000 đồng/ tháng

                - Có phụ cấp ăn trưa điện thoại + Thưởng tháng lương T13

                - Thưởng các ngày lễ tết: 48.000.000TR/năm

                - Nghỉ phép 15 ngày/năm

                - Địa điểm làm việc: 219 Trung Kính, Cầu Giấy, HN

                - Được ký hợp đồng lao động và tham gia các loại bảo hiểm theo quy định của Nhà nước.

                - Được đào tạo tại công ty hoặc tham gia các khóa đào tạo nâng cao, bổ ích bên ngoài.

                - Tham gia nhiều hoạt động văn hóa, thể dục, thể thao, giải trí.

                - Chính sách du lịch, nghỉ dưỡng, khám sức khỏe định kỳ cho CBNV.'),
                'expire_at' => '2023-08-21',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-16 09:05:00'
            ],
            [
                'id' => 7,
                'employer_id' => 9,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Chuyên viên Chính sách & Phát triển nguồn lực',
                'address' => 'Số 02 Tôn Thất Tùng, P. Trung Tự, Q. Đống Đa, Hà Nội',
                'amount' => 5,
                'min_salary' => 20,
                'max_salary' => 23,
                'yoe' => 3,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Chịu trách nhiệm sửa đổi, bổ sung, cập nhật các tài liệu tổ chức như: Sơ đồ tổ chức, Racis, chức năng nhiệm vụ, mô tả công việc, phân quyền, ủy quyền.
                Tham gia xây dựng, rà soát sửa đổi, cập nhật các chính sách, văn bản quy định về tổ chức và nhân sự đảm bảo phù hợp với định hướng phát triển của Công ty.
                Tham gia truyền thông, hướng dẫn, đào tạo, giải đáp thắc mắc cho các đơn vị trong quá trình triển khai, đưa vào áp dụng các chính sách về tổ chức và nhân sự.
                Phối hợp với các phòng ban xây dựng, cập nhật các chỉ tiêu hiệu quả công việc cho các phòng ban và từng chức danh.
                Kiểm soát và tổng hợp kết quả đánh giá hiệu quả công việc và tuân thủ phòng nhân sự.
                Thực hiện báo cáo nhân sự theo yêu cầu.
                Thực hiện các công việc khác theo yêu cầu.
                YÊU CẦU CÔNG VIỆC
                Tốt nghiệp đại học loại Khá trở lên hệ chính quy Đại học Kinh tế quốc dân, Đại học Ngoại thương, Học viện Tài chính, Đại học Luật ngành Quản trị nhân sự/ Kinh tế lao động, Luật kinh tế hoặc các chuyên ngành liên quan.
                Ưu tiên có các chứng chỉ đào tạo về tuyển dụng, đánh giá nhân sự, quản trị nhân sự.
                Có tối thiểu 03 năm kinh nghiệm ở vị trí chuyên viên chính hoặc tương đương trong lĩnh vực chuyên môn.
                Có kinh nghiệm làm việc tại mảng Phát triển tổ chức tại các Công ty/Tập đoàn có quy mô từ 600 nhân sự trở lên.
                Kỹ năng giao tiếp, làm việc độc lập và làm việc nhóm tốt.
                Tư duy logic, kỹ năng phân tích và tổng hợp tốt.
                Chủ động, sáng tạo, chịu được áp lực cao trong công việc.
                Có khả năng đọc hiểu tốt các tài liệu bằng Tiếng Anh; Thành thạo tin học văn phòng, sử dụng phần mềm Quản trị nhân sự thành thạo.'),
                'expire_at' => '2023-08-22',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-22 09:05:00'
            ],
            [
                'id' => 8,
                'employer_id' => 9,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Công Nhân Lắp Đặt Cửa tại HCM và các tỉnh',
                'address' => ' 948 Hương Lộ 2, Bình Trị Đông A, Bình Tân, Hồ Chí Minh',
                'amount' => 5,
                'min_salary' => 9,
                'max_salary' => 15,
                'yoe' => 0,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Công việc chính:

                - Nhận cửa tại công trình; Tiến hành lắp đặt các sản phẩm cửa cho khách hàng tại nhà riêng và các dự án

                Quyền lợi:

                - Thu nhập bình quân 9-15 triệu/tháng tùy vào khối lượng và thời gian làm việc

                - Nhiều khoản phụ cấp

                - Cơ hội thăng tiến rộng mở (lên các vị trí Đội phó/đội trưởng)

                - Khám sức khỏe hàng năm

                - Hưởng đầy đủ quyền lợi, chế độ theo Luật lao động và chính sách của Công ty

                YÊU CẦU CÔNG VIỆC
                - Có xe máy cá nhân

                - Có thể linh động di chuyển theo công trình

                - Sức khỏe tốt

                - Không yêu cầu kinh nghiệm, trình độ'),
                'expire_at' => '2023-08-21',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-20 09:05:00'
            ],
            [
                'id' => 9,
                'employer_id' => 10,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Sale Admin',
                'address' => 'Lô CX01, Khu đô thị Văn Khê, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam',
                'amount' => 5,
                'min_salary' => 8,
                'max_salary' => 10,
                'yoe' => 0,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Theo dõi tiến độ xử lý đơn hàng trên phần mềm.
                Xác nhận các thanh toán chuyển khoản của khách hàng.
                Điều phối đơn hàng cho các kho/chi nhánh trực thuộc.
                Hỗ trợ khách hàng xử lý các vấn đề trong quá trình mua hàng.
                Thực hiện các công việc khác, báo cáo công việc theo yêu cầu cho cấp quản lý trực tiếp.
                YÊU CẦU CÔNG VIỆC
                Tốt nghiệp Cao đẳng trở lên chuyên ngành Kế toán, dược,......
                Không yêu cầu kinh nghiệm.
                Uư tiên ứng viên đã có kinh nghiệm vị trí tương đương về ngành dược.
                Biết sử dụng các phần mềm ứng dụng (word, excel, phần mềm quản lý bán hàng...).
                Kỹ năng giao tiếp, chủ động trong công việc.
                Chủ động, có trách nhiệm trong công việc.'),
                'expire_at' => '2023-08-23',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-22 09:05:00'
            ],
            [
                'id' => 10,
                'employer_id' => 10,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Chuyên viên UI/UX',
                'address' => 'Lô CX01, Khu đô thị Văn Khê, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam',
                'amount' => 5,
                'min_salary' => 15,
                'max_salary' => 20,
                'yoe' => 2,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Thiết kế UI/UX cho App, Website, Systerm và các sản phẩm khác theo tiêu chí thân thiện với người dùng.
                Phối hợp chặt chẽ với các bộ phận liên quan (Customer, Marketing, Development, QA,…) để lựa chọn phương án thiết kế UX xuyên suốt dự án sản phẩm/dịch vụ.
                Nghiên cứu và cập nhật các xu hướng thiết kế UI/UX hiện nay.
                YÊU CẦU CÔNG VIỆC
                Có ít nhất 1 năm kinh nghiệm ở vị trí tương đương.
                Có khiếu thẩm mỹ tốt, nhận diện và biết sắp xếp bố cục hợp lý.
                Sử dụng thành thạo các phần mềm thiết kế ( Photoshop, Figma, Sketch,...).
                Sử dụng thành thạo công cụ dựng Prototype sản phẩm ( Invisionapp, Marvel, Framer…).
                Thành thạo trong việc thiết kế 3D.
                Có kinh nghiệm thiết kế nhân vật, game.
                Có kiến thức về HTML/CSS là một lợi thế.'),
                'expire_at' => '2023-08-25',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-18 09:05:00'
            ],
            [
                'id' => 11,
                'employer_id' => 11,
                'jtype_id' => 1,
                'jlevel_id' => 3,
                'jname' => 'IT Team Leader',
                'address' => 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội',
                'amount' => 1,
                'min_salary' => 45,
                'max_salary' => 50,
                'yoe' => 5,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                - Understand and optimize user requirements
                - Participate in all stages of the system development life cycle
                - Design and develop high availability, automation and performance systems to support company departments in fulfilling their business goals effectively
                - Write and design good, testable code with high performance
                - Research and upgrade the systems when necessary
                - Participate in the management of processes and systems of related departments
                - Developing new projects periodically according to business strategies
                - Mentor team members and improve team productivity

                YÊU CẦU CÔNG VIỆC
                - Bachelor degree in IT/Computer Science.
                - 5+ years of progressive web development experience in a software engineer role (including progressing from Junior to Intermediate to Senior engineer roles).
                - Minimum of 2 year of experience as Team Leader in leading Java IT projects.
                - Experience in the following technologies: JavaScript, JSON, CSS, JQuery, Eclipse, Ajax and HTML 5.
                - Experience in software development, Java Technologies/framework: Spring/Spring boot/ Oracle/SQL database.
                - Experience in working with major system in Sales / Logistic is a plus.
                - Strong English skills in verbal and communication.
                - Experience in Jenkins, AWS is a plus.'),
                'expire_at' => '2023-08-21',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-16 09:05:00'
            ],
            [
                'id' => 12,
                'employer_id' => 11,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'E-commerce Marketing Staff',
                'address' => 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội',
                'amount' => 3,
                'min_salary' => 10,
                'max_salary' => 16,
                'yoe' => 1,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                - Develop media strategies, propose and plan media budgets
                - Execute, analyze, and optimize advertisement both on-site (ecommerce platforms: Shopee, Lazada, Tiki, etc.) and off-site (Facebook, Google, etc.)
                - Monitor E-Commerce trends, interesting initiatives, and market best practices for improving site conversion and shopper engagement
                - Collaborate with the internal team - as well as external partners (eg: e-commerce platforms, media agency, etc.) to deliver the best E-commerce campaigns and achieve business KPIs
                - Contact with the related team to provide campaign performance insights and evaluation and suggest key learnings
                - Perform other related duties as assigned or requested

                YÊU CẦU CÔNG VIỆC
                - Bachelor’s degree in Business Administration/Marketing/Economics
                - At least 1 years experience in the advertising field, online media planning, or relevant field
                - Preferential treatment for those with experience in E-commerce
                - Effective in time management, planning and execution
                - Creative and proactive mindset and a good team player
                - Strong sense of urgency and ability to work in a fast-paced environment'),
                'expire_at' => '2023-08-22',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-20 09:05:00'
            ],
            [
                'id' => 13,
                'employer_id' => 11,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Java Developer (Spring, MVC, Javascript)',
                'address' => 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội',
                'amount' => 5,
                'min_salary' => 18,
                'max_salary' => 30,
                'yoe' => 1,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                - Tiếp nhận/xử lý các yêu cầu từ các phòng và ban lãnh đạo công ty.

                - Cải thiện/năng cấp performance/ui/ux hệ thống.

                - Kết nối phát triển các tính năng mới với các đối tác.

                - Xây dựng tài liệu hướng dẫn hệ thống cho người dùng.

                YÊU CẦU CÔNG VIỆC
                - Tốt nghiệp đại học chuyên nghành CNTT/Khoa học máy tính.

                - Có tối thiểu 2 năm kinh nghiệm phát triển phần mềm.

                - Nắm vững kiến thức Java Core.

                - Có kinh nghiệm tối thiểu 1 năm phát triển bằng ngôn ngữ Java( framework: Spring / Spring boot).

                - Có kinh nghiệm thiết kế/làm việc với các cơ sở dữ liệu Oracle/SQL Server.

                - Có kinh nghiệm làm việc với hệ thống trong lĩnh vực Bán hàng, Logistic, E-Com sẽ là một điểm cộng.

                - Có tinh thần trách nhiệm trong công việc và tính tự giác cao, có thể làm việc độc lập hoặc theo nhóm.

                - Toeic >= 500.'),
                'expire_at' => '2023-08-16',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-15 09:05:00'
            ],
            [
                'id' => 14,
                'employer_id' => 12,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Nhân Viên Kinh Doanh',
                'address' => ' Lô DM7-6 Điểm tiểu thủ Công nghiệp Làng Nghề Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông, Thành phố Hà Nội',
                'amount' => 4,
                'min_salary' => 8,
                'max_salary' => 15,
                'yoe' => 0,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Duy trì hệ thống Đại lý Cty đang kinh doanh: Phụ trách 1 vùng khách hàng riêng: hoàn thành chỉ tiêu doanh số, thị phần khu vực mình phụ trách.
                Chịu trách nhiệm mở hệ thống đại lý mới.
                Làm kế hoạch bán hàng cho từng Khách hàng, từng tháng.
                Đàm phán giá bán, chính sách bán hàng, chính sách hỗ trợ marketing với Khách hàng và với người Phụ trách sản phẩm (PM).
                Đi khảo sát thị trường thường xuyên, gặp gỡ Khách hàng.
                Triển khai các hoạt động marketing, trưng bày sản phẩm tại Khách hàng.
                Thu thập thông tin thị trường, giá cả và chương trình của đối thủ.
                Chịu trách nhiệm đào tạo nhân viên Kinh doanh của Khách hàng về sản phẩm mình đang kinh doanh.
                Tiếp nhận thông tin, khiếu nại, đơn hàng của khách hàng và phải trực tiếp giải quyết, nếu chuyển cho bộ phận liên quan thì phải trực tiếp đôn đốc.
                Đánh giá, đề xuất hạn mức nợ và chịu trách nhiệm theo quy định nếu xảy ra rủi ro mất nợ.
                Kiểm soát việc niêm yết giá của từng KH.
                Báo cáo:
                +Lập báo cáo tình hình KD hàng tuần.

                + Lập báo cáo cập nhật giá đối thủ.

                YÊU CẦU CÔNG VIỆC
                Ngoại hình khá, sức khỏe tốt.
                Ít nhất 1 năm kinh nghiệm.
                Khả năng tiếp thu và xử lý thông tin tốt, giọng nói dễ nghe.
                Khả năng khai thác, tạo dựng các mối quan hệ.
                Có tính kỷ luật cao, có ý thức làm việc tập thể tốt.
                Khả năng làm việc nhóm, chịu được áp lực công việc.
                Trung thực, nhanh nhẹn, chu đáo, ham học hỏi.'),
                'expire_at' => '2023-08-17',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-16 09:05:00'
            ],
            [
                'id' => 15,
                'employer_id' => 12,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Trưởng Phòng Kinh Doanh',
                'address' => ' Lô DM7-6 Điểm tiểu thủ Công nghiệp Làng Nghề Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông, Thành phố Hà Nội',
                'amount' => 1,
                'min_salary' => null,
                'max_salary' => null,
                'yoe' => 0,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                - Điều hành Phòng Kinh doanh Khu vực Phía Bắc.
                - Chịu trách nhiệm doanh thu và nợ.
                - Phân tích, dự báo lập kế hoạch kinh doanh.
                - Nghiên cứu và tổng hợp các chính sách Giá, chiết khấu.
                - Triển khai các chương trình marketing.
                - Đào tạo đội ngũ kinh doanh.
                - Xây dựng chính sách thưởng, đãi ngộ cho KD.
                - Quan hệ với các đối tác quan trọng.
                - Phối hợp với bộ phận Sản phẩm trong việc nghiên cứu & phát triển sản phẩm tiềm năng.

                YÊU CẦU CÔNG VIỆC
                - Tốt nghiệp Đại học chính quy: Thương mại, QTKD, Ngoại thương, Marketing.
                - Sáng tạo, đam mê và khao khát thăng tiến trong công việc.
                - Hiểu biết sâu về Kế hoạch, kênh phân phối, marketing, chính sách bán hàng, quan hệ Khách hàng.
                - Thành thạo Vi tính văn phòng & Internet.
                - Có khả năng giao tiếp bằng tiếng Anh.
                - Có kinh nghiệp trong ngành Máy tính là một ưu tiên.

                *** Hồ sơ ứng tuyển (photo) bao gồm:

                + SYLL,

                + Thư xin việc

                + Các bằng cấp liên quan

                - Địa điểm làm việc tại: Lô DM7-6, Điểm Tiểu Thủ Công Nghiệp Làng Nghề Vạn Phúc, Hà Đông, TP.Hà Nội'),
                'expire_at' => '2023-08-18',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-17 09:05:00'
            ],
            [
                'id' => 16,
                'employer_id' => 13,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Nhân Viên Kinh Doanh Logistics',
                'address' => 'Tầng 4, tòa nhà FLC Landmark Tower, Ngõ 5 Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm
                32 Thủy Lợi, Phước Long A, Quận 9, Thành phố Hồ Chí Minh',
                'amount' => 3,
                'min_salary' => 10,
                'max_salary' => 15,
                'yoe' => 2,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                - Thực hiện tìm kiếm khách hàng, bán hàng dịch vụ Logistics.
                - Xây dựng giá cước, cơ chế kinh doanh, phương án cung cấp dịch vụ cho khách hàng.
                - Tìm kiếm, liên hệ các đối tác vận chuyển để có giá cước hợp lý cung cấp cho khách hàng.
                - Thực hiện các công việc khác do lãnh đạo trung tâm giao.

                YÊU CẦU CÔNG VIỆC
                - Tốt nghiệp Đại học chuyên ngành kinh tế, thương mại.
                - Hiểu biết về dịch vụ Logistics và nghiệp vụ xuất - nhập khẩu.
                - Ưu tiên ứng viên đã có kinh nghiệm làm kinh doanh dịch vụ Logistics, xuất nhập khẩu.
                - Chỉ tuyển nam.'),
                'expire_at' => '2023-08-19',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-18 09:05:00'
            ],
            [
                'id' => 17,
                'employer_id' => 13,
                'jtype_id' => 1,
                'jlevel_id' => 4,
                'jname' => 'Trưởng Bưu Cục Khách Hàng Lớn',
                'address' => 'Khu đô thị Hành Lạc, huyện Văn Lâm, Hưng Yên
                KDC Hưng Phú 1, Hưng Phú, Cái Răng, Cần Thơ',
                'amount' => 1,
                'min_salary' => 12,
                'max_salary' => 15,
                'yoe' => 2,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Địa điểm làm việc: Huyện Văn Lâm, Tỉnh Hưng Yên, TP. Cần Thơ

                Mô tả công việc: Quản lý, điều hành chung các hoạt động sản xuất, kinh doanh của Bưu cục KHL trong hoạt động kinh doanh dịch vụ Chuyển phát nhanh EMS và Logistics, cụ thể:

                - Điều hành công tác kinh doanh:
                + Xây dựng kế hoạch hoạt động của Bưu cục thực hiện các chỉ tiêu kinh doanh hàng tháng, năm và theo giai đoạn.
                + Tìm kiếm, phát triển khách hàng, chăm sóc khách hàng; phát triển doanh thu của Bưu cục.

                - Quản lý nhân sự - tài chính:
                + Chịu trách nhiệm về nhân sự: Nhân viên kinh doanh, Giao dịch viên, nhân viên thu gom
                + Kiểm soát rủi ro liên quan đến công nợ khách hàng của Bưu cục.

                - Quản lý vận hành:
                + Thực hiện và quản lý việc vận hành chấp nhận và chuyển phát hàng hóa tại Bưu cục.
                + Giám sát các công đoạn thu gom và chấp nhận, đóng chuyển và giao nhận trong quy trình cung cấp dịch vụ tại Bưu cục nhằm dảm bảo chất lượng dịch vụ.

                YÊU CẦU CÔNG VIỆC
                YÊU CẦU:
                - Trình độ: Tốt nghiệp Đại học/Cao đẳng các chuyên ngành Tài chính - Kế toán, Kinh tế, Quản trị kinh doanh (Hệ chính quy)
                - Tuổi: 25 - 35 tuổi (ưu tiên nam)
                - Có kỹ năng và kinh nghiệm quản lý; ưu tiên ứng viên đã có kinh nghiệm làm Trưởng Bưu cục tại các Công ty vận chuyển.

                CHẾ ĐỘ:
                - Thu nhập hấp dẫn (Trao đổi cụ thể khi phỏng vấn)
                - Thưởng các ngày nghỉ lễ, Tết, hưởng các khoản phúc lợi khác trong năm theo quy định...
                - Xem xét tăng lương hàng năm theo năng lực,
                - Được hưởng đầy đủ BHXH, BHYT và BHTN theo Luật lao động hiện hành. Gói chăm sóc sức khỏe riêng theo chế độ của công ty.
                - Nghỉ phép năm theo quy định.
                - Môi trường làm việc chuyên nghiệp, năng động, sáng tạo, được đào tạo với các chuyên gia huấn luyện, cơ hội thăng tiến cao.
                - Tham gia các hoạt động chung của Công ty: Du lịch, ca nhạc, thể thao, Team Building...'),
                'expire_at' => '2023-08-20',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-20 09:05:00'
            ],
            [
                'id' => 18,
                'employer_id' => 14,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Junior C# Developer (.Net)',
                'address' => 'Tầng 17, Tòa nhà IDMC Mỹ Đình, số 15 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội',
                'amount' => 6,
                'min_salary' => 18,
                'max_salary' => 27,
                'yoe' => 2,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                • Phát triển mới các modules, chức năng, bảo trì phần mềm kế toán.

                • Phân tích, thảo luận giải pháp với Trưởng nhóm , Trưởng nhóm phụ trách kỹ thuật, Trưởng dự án và triển khai các giải pháp.

                • Viết tài liệu liên quan đến công việc được giao

                • Hỗ trợ team CS xử lý lỗi cho khách hàng

                YÊU CẦU CÔNG VIỆC
                • Có một năm kinh nghiệm làm việc với các dự án về .NET, .NET core  C# và ASP.NET MVC từ  1 năm trở lên

                • Có kinh nghiệm làm việc với Infragistics windows forms.

                • Có kinh nghiệm làm việc với MSSQL Server (từ phiên bản 2016), biết sử dụng các công cụ để tối ưu stored procedure, các câu lệnh T-SQL

                • Hiểu về mô hình phát triển Agile- Scrum

                • Hiểu về lập trình hướng đối tượng, nguyên lý SOLID

                Chế độ:

                Giờ làm việc hành chính từ thứ 2- thứ 6. Nghỉ thứ 7, chủ nhật hàng tuần
                Lương cứng: upto 27 triệu/tháng
                Được làm việc trong môi trường chuyên nghiệp, trẻ trung, năng động.
                Đóng  BHXH, BHYT, BHTN theo quy định của nhà nước
                Thưởng các ngày lễ, tết, sinh nhật (1/1, 30/4,1/5,1/6, 2/9, Trung thu,…….)
                Khám sức khỏe, du lịch, teambuilding, ……theo quy định công ty
                Chế độ hiếu/hỉ; ốm đau theo quy định công ty
                Cơ hội làm việc với các chuyên gia Hàn Quốc
                Cơ hội học tiếng Hàn miễn phí'),
                'expire_at' => '2023-08-15',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-14 09:05:00'
            ],
            [
                'id' => 19,
                'employer_id' => 14,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Kiểm Thử Phần Mềm (Software Tester )',
                'address' => 'Tầng 17, Tòa nhà IDMC Mỹ Đình, số 15 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội',
                'amount' => 2,
                'min_salary' => 10,
                'max_salary' => 16,
                'yoe' => 3,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Thiết kế testcase cho phần mềm dựa trên tài liệu yêu cầu, tài liệu đặc tả và thiết kế (Phần mềm ERP)
                Thực hiện test dựa trên testplan và testcase
                Tìm lỗi sản phẩm, phân tích nguyên nhân gây ra lỗi và quản lý hoạt động fix lỗi.
                Làm báo cáo test và đánh giá chất lượng sản phẩm trước khi bàn giao cho khách hàng.
                Đề xuất các hoạt động cải tiến chất lượng sản phẩm

                YÊU CẦU CÔNG VIỆC
                Từ 2 năm kinh nghiệm trở lên ở vị trí tương đương
                Có kinh nghiệm về các hệ thống erp, phần mềm kế toán hoặc có kiến thức chuyên ngành tài chính kế toán
                Có kiến thức về phát triển dự án theo phương pháp Agile
                Hiểu biết về Test Performance và Load Test.
                Có tính cẩn thận, tỉ mỉ, kiên nhẫn, có trách nhiệm và chịu được áp lực công việc trong công việc
                Có khả năng làm việc độc lập và theo nhóm, nhóm dự án từ nhiều quốc gia
                Có kỹ năng giao tiếp, kỹ năng giải quyết vấn đề tốt (có thể tiếng Anh là một lợi thế)

                Quyền lợi:

                Lương: upto 16 triệu. Làm việc T2-T6
                Cơ hội tiếp cận và học hỏi công nghệ tiên tiến về Big Data - Automation - OCR
                Cơ hội phát triển lên TestLead
                Được làm việc trong môi trường chuyên nghiệp, trẻ trung, năng động.
                Đóng  BHXH, BHYT, BHTN theo quy định của nhà nước
                Thưởng các ngày lễ, tết, sinh nhật (1/1, 30/4,1/5,1/6, 2/9, Trung thu,…….)
                Khám sức khỏe, du lịch, teambuilding, ……theo quy định công ty
                Chế độ hiếu/hỉ; ốm đau theo quy định công ty
                Cơ hội làm việc với các chuyên gia Hàn Quốc
                Cơ hội học tiếng Hàn miễn phí'),
                'expire_at' => '2023-08-16',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-15 09:05:00'
            ],
            [
                'id' => 20,
                'employer_id' => 14,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Technical Sales / Sales IT',
                'address' => '163 Nguyễn Văn Trỗi, phường 11, Phú Nhuận, Thành phố Hồ Chí Minh',
                'amount' => 5,
                'min_salary' => 18,
                'max_salary' => 30,
                'yoe' => 3,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                InfoPlus cung cấp các giải pháp thiết bị công nghệ thông tin của các hãng như: Secui, Piolink, Genians, Duruan, Netand, Jirasoft,..

                Cụ thể là các giải pháp network, security: firewall, IPS, Anti-DDos, ADS, WAF, Cloud Security Switch, NAC, e-DRM, ….

                - Tìm kiếm, thực hiện Maketing, khai thác và phát triển các cơ hội kinh doanh với các khách hàng tiềm năng là các reseller
                - Thực hiện bán sản phẩm, quản lí và hỗ trợ cho Reseller

                - Quản lí tiến độ và các mốc quan trọng của dự án. Làm việc với các bên liên quan như nhà cung cấp, khách hàng, bộ phận bán hàng… để triển khai dự án
                - Phân tích & dự báo tình hình khách hàng, thị trường, đề xuất các đối sách cần thiết kịp thời.

                -Chi tiết công việc sẽ trao đổi kỹ hơn khi phỏng vấn.

                YÊU CẦU CÔNG VIỆC
                - Tối thiểu 02 năm kinh nghiệm kinh doanh các sản phẩm/giải pháp network, security

                - Có khả năng trình bày, diễn giải xúc tích, dễ hiểu.

                - Có khả năng đọc hiểu các tài liệu kỹ thuật tiếng Anh.

                - Có thể giao tiếp Tiếng Anh là một lợi thế.

                - Nộp CV bằng tiếng Anh

                Quyền lợi

                Lương up to 30 triệu. Làm việc từ T2-T6, nghỉ T7, CN

                Được làm việc trong môi trường chuyên nghiệp, trẻ trung, năng động.

                Đóng BHXH, BHYT, BHTN theo quy định của nhà nước

                Thưởng các ngày lễ, tết, sinh nhật (1/1, 30/4,1/5,1/6, 2/9, Trung thu,…….)

                Khám sức khỏe, teambuilding, ……theo quy định công ty

                Chế độ hiếu/hỉ; ốm đau theo quy định công ty

                Cơ hội làm việc với các chuyên gia Hàn Quốc

                Cơ hội học tiếng Hàn miễn phí'),
                'expire_at' => '2023-08-17',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-16 09:05:00'
            ],
            [
                'id' => 21,
                'employer_id' => 15,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Chuyên viên Tài trợ thương mại (SME) - Khu vực Hưng Yên',
                'address' => 'Đình Đông Khúc, Vĩnh Khúc, Văn Giang, Hưng Yên',
                'amount' => 2,
                'min_salary' => 15,
                'max_salary' => 30,
                'yoe' => 1,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Triển khai upsales cùng Chuyên viên Quan hệ Khách hàng (RM SME) đối với danh mục Khách hàng hiện hữu đồng thời phát triển bán mới các KH có nhu cầu sử dụng dịch vụ TTTM thông qua:
                - Xây dựng các giải pháp bán hàng tư vấn về sản phẩm TTTM và ngoại hối cho khách hàng;
                - Xử lý giao dịch phát hành/sửa đổi LC nhập khẩu;
                Thiết lập mối quan hệ hiệu quả và chuyên nghiệp với nhân sự chủ chốt của khách hàng TTTM thuộc danh mục được phân giao.
                Xử lý vướng mắc trong quá trình cung cấp sản phẩm, dịch vụ TTTM tới khách hàng kịp thời thông qua phối hợp với các bộ phận, phòng ban liên quan.
                Cập nhật nâng cao kiến thức về nghiệp vụ thương mại quốc tế, sản phẩm TTTM, chính sách và quy trình của ngân hàng.
                Thu thập, phản hồi thông tin (các điểm chưa cạnh tranh, lỗ hổng của sản phẩm…) cũng như đề xuất các sáng kiến cải tiến.
                Hướng dẫn cho RM SME tại Chi nhánh về hồ sơ, kỹ năng tư vấn TTTM.
                YÊU CẦU CÔNG VIỆC
                Cử nhân chuyên ngành Thanh toán quốc tế, Ngân hàng, Kinh tế đối ngoại, Tài chính ngân hàng …
                TOEIC 450 trở lên hoặc chứng chỉ tương đương
                Hiểu biết về hoạt động kinh doanh Tài Chính, tiền tệ, ngân hàng, thanh toán quốc tế, tài trợ thương mại, xuất nhập khẩu.v..v...'),
                'expire_at' => '2023-08-18',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-17 09:05:00'
            ],
            [
                'id' => 22,
                'employer_id' => 15,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Chuyên viên UB (Chuyên viên Tư vấn) - MB Bình Tân',
                'address' => '6D Trường Sa, phường 17, Bình Thạnh, Hồ Chí Minh',
                'amount' => 2,
                'min_salary' => 8,
                'max_salary' => 15,
                'yoe' => 8,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Thực hiện công tác bán hàng tại sàn giao dịch chi nhánh: tư vấn và bán các sản phẩm, dịch vụ của MB cho Khách hàng cá nhân bao gồm: Huy động vốn, tài khoản thanh toán, thẻ, ngân hàng điện tử… Bán chéo sản phẩm dịch vụ của MB…
                Thực hiện cung cấp dịch vụ tại sàn giao dịch chi nhánh
                Tiếp nhận và giải quyết khiếu nại, thắc mắc của khách hàng, hỗ trợ khách hàng; chào đón, phân luồng và tư vấn khách hàng
                Thực hiện các công việc khác theo phân công của Cán bộ quản lý trực tiếp phù hợp với năng lực và phạm vi công việc.
                YÊU CẦU CÔNG VIỆC
                Tốt nghiệp Đại học trở lên các chuyên ngành kinh tế
                Hiểu biết các kiến thức về sản phẩm, dịch vụ của Ngân hàng dành cho Khách hàng cá nhân
                Ưu tiên ứng viên có kinh nghiệm  ở vị trí quan hệ khách hàng/Giao dịch viên/Chăm sóc khách hàng/Nhân viên kinh doanh...
                Kỹ năng bán hàng, kỹ năng giao tiếp tốt
                Ngoại hình khá (Nam cao 1m68 trở lên, nữ cao 1m58 trở lên)
                Thành thạo tin học văn phòng cơ bản (word, excel, outlook…)
                Ưu tiên ứng viên có ngoại ngữ tốt
                Địa điểm làm việc: MB Bình Tân - Số 435 - 441 Đường số 7, P Bình Trị Đông B, Q Bình Tân, Tp HCM'),
                'expire_at' => '2023-08-19',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-18 09:05:00'
            ],
            [
                'id' => 23,
                'employer_id' => 16,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Marketing Executive',
                'address' => 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam',
                'amount' => 3,
                'min_salary' => null,
                'max_salary' => null,
                'yoe' => 8,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Execute and report on the results of Inbound Marketing activities: SEO, SEM, Social Media, Email Marketing, Landing pages, etc.
                Plan and organize physical events and virtual events professionally.
                Brand management, planning and implementing PR activities, building Customer Success, etc
                Propose new ideas, and regularly update new trends that can be applied in practice.
                Participate in internal communication activities: Content, Team building, etc.
                Other tasks assigned by the line manager.
                YÊU CẦU CÔNG VIỆC
                Graduated from University majoring in Marketing, Communication, Business Administration or related fields
                 02+ years of experience in a similar position
                Ability to write and edit content, redact documents, PR
                Ability to design basic media publication
                Language proficiency level of TOEIC > 700
                Positive, dynamic, creative, progressive and inquisitive attitude
                Initiative and high responsibility
                Result-oriented & can-do attitude
                Demonstrate open mindedness, ability to listen, high sense of curiosity to understand trends and needs
                Good communication, presentation skills, ability to be MC is an advantage
                Critical thinking and good problem-solving skills, ability to multitask
                Adaptable and adept in working in a high-growth environment.
                COMPANY BENEFITS

                Opportunity to work in global projects of fast-developing companies and be a part of innovation, big SAP projects.
                13th-month salary.
                Participating fully in benefits according to regulations and policies of the company.
                Other company benefits include participating in comprehensive Citek care insurance, annual domestic or international travel, and annual medical examination…
                Participate in the training program to improve knowledge about SAP ERP, B2B, techniques.
                Young, dynamic, and friendly working environment.
                Location

                Ha do Building, floor 9 - 10, 2 Hong Ha Street, Ward 2, Tan Binh District, HCM City.
                Salary & Benefits

                According to the company\'s regulations
                Working Time

                From Monday to Friday: 8h30 - 17h30 (Lunch Break 12h00 - 13h00 )'),
                'expire_at' => '2023-08-19',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-18 09:05:00'
            ],
            [
                'id' => 24,
                'employer_id' => 16,
                'jtype_id' => 1,
                'jlevel_id' => 2,
                'jname' => 'Presale ERP Oracle NetSuite',
                'address' => 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam',
                'amount' => 1,
                'min_salary' => null,
                'max_salary' => null,
                'yoe' => 5,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                The opening is for Presales of Oracle NetSuite:

                Research and understand the features and functionalities of Oracle NetSuite products in order to introduce and consult customers.
                Plan and prepare reports and documents presenting solutions, implementation costs, service quality, and other evaluation criteria.
                Work and interact with customers to collect information about their needs and requirements, provide appropriate solutions, and advise on the company\'s products and services.
                Advise and answer customers\' questions about the company\'s products and services.
                Participate in the negotiation process and persuade customers about the Oracle NetSuite ERP solution and provide technical support to the sales team.
                Support the implementation team during the ERP project implementation, including providing solutions, proposing improvements, and monitoring the implementation process.
                Ensure that the solutions implemented meet customer requirements and quality standards.
                Participate in the analysis of requirements, surveying customer needs, and proposing appropriate solutions for Oracle NetSuite ERP.
                YÊU CẦU CÔNG VIỆC
                Citek is looking for talents:

                Senior Business Consultant : At least 5 years of relevant work experience in ERP Consultant (Oracle NetSuite, SAP, B1, Microsoft Dynamic) or a similar field preferred.
                Bachelor and experience:

                Graduated from university majoring in Finance, Accounting,  Business Administration, Logistic, Information Systems, Business Administration, Economics, International Business.
                Involved in at least 3 full cycle projects ERP.
                Working knowledge of integration with other ERP.
                Strong in the management of ERP Finance, ERP SCM, Integration (ERP & Other system / platform).
                Able to travel according to job requirements.
                Have a development orientation and long-term attachment to the ERP industry.
                Have a development orientation and long-term attachment to the Oracle NetSuite.
                Skills:

                English: Toeic 650 or Toiec 700
                Microsoft
                Communication Skill
                Time Management
                Able
                to work under high pressure
                COMPANY BENEFITS

                Salary and commission: Negotiable according to capacity and working ability.
                Opportunity to work in global projects of the fast developing company and being a part of innovation, big Oracle NetSuite projects.
                Participating fully in benefits according to regulations and policies of the company.
                Other company benefits such as: participating in comprehensive Citek care insurance, annual domestic or international travel, annual medical examination...
                Participate in the training program to improve knowledge about Oracle NetSuite, B2B, technique.
                Young, dynamic, and friendly working environment.
                Other Information:

                Working time: Mon - Fri (8:30 am - 5:30 pm)
                Probation: 2 months (full 100% offer)
                Location

                Ha do Building, floor 9+10, 2 Hong Ha Street, Ward 2, Tan Binh District, HCM City.
                Salary & Benefits

                According to the company\'s regulations
                Working Time

                From Monday to Friday: 8h30 - 17h30 (Lunch Break 12h00 - 13h00 )'),
                'expire_at' => '2023-08-20',
                'is_hot' => 0,
                'is_active' => 1,
                'created_at' => '2023-07-19 09:05:00'
            ],
            [
                'id' => 25,
                'employer_id' => 10,
                'jtype_id' => 3,
                'jlevel_id' => 1,
                'jname' => 'Thực tập sinh Marketing',
                'address' => 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam',
                'amount' => 4,
                'min_salary' => null,
                'max_salary' => null,
                'yoe' => 0,
                'gender' => null,
                'description' => htmlspecialchars('
                MÔ TẢ CÔNG VIỆC
                Lên ý tưởng, sản xuất và tối ưu nội dung (text, image, video) trên Website và các kênh Social như Facebook, Linkedin, YouTube, TikTok,…
                Tham gia tổ chức các sự kiện online và offline
                Đóng góp ý tưởng sáng tạo cho từng chiến dịch Marketing
                Cập nhật các tin tức về thị trường, xu hướng mới
                YÊU CẦU CÔNG VIỆC
                Sinh viên năm cuối/mới tốt nghiệp chuyên ngành Marketing, PR, Ngoại ngữ, Kinh tế, QTKD, Thương mại điện tử,…
                Thích viết lách, có kiến thức nền tảng về Marketing: SEO, Website, content,…
                Khả năng giao tiếp và đọc hiểu Anh văn tốt (tối thiểu 550 Toeic)
                Có khả năng thiết kế và chỉnh sửa video cơ bản, ưu tiên có khả năng thiết kế trên Canva, Ps, Ai
                Có kinh nghiệm phát triển nội dung trên kênh social và xây dựng cộng đồng là một lợi thế.
                Năng động, sáng tạo, chủ động học hỏi và cầu tiến.
                Tinh thần trách nhiệm cao, cẩn thận trong công việc.
                Yêu thích và có định hướng phát triển lâu dài trong lĩnh vực Marketing
                Khả năng làm việc nhóm tốt, có khả năng phân tích và phản biện tốt'),
                'expire_at' => '2023-08-21',
                'is_hot' => 1,
                'is_active' => 1,
                'created_at' => '2023-07-20 09:05:00'
            ],

        ]);
    }
}
