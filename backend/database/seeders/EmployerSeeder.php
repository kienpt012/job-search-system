<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EmployerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('employers')->insert([
            [
                'id' => 5,
                'user_id' => 5,
                'name' => 'TECHCOMBANK',
                'address' => 'HO Miền Bắc: Số 6 Quang Trung, phường Trần Hưng Đạo, Quận Hoàn Kiếm, Thành phố Hà Nội
                HO Miền Nam: Số 23 Lê Duẩn, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
                'min_employees' => 10,
                'max_employees' => 150,
                'contact_name' => 'Khối Quản Trị Nguồn Nhân Lực',
                'phone' => '0333333331',
                'website' => 'https://techcombank.com/',
                'description' => 'Lĩnh vực kinh doanh là viễn thông và các dịch vụ Giá trị gia tăng. Với tiêu chí hàng đầu là coi trọng giá trị nguồn nhân lực, công ty luôn hướng tới việc tạo điều kiện làm việc tốt nhất cho nhân viên để phát huy hết khả năng, tạo ra giá trị lớn cho công ty. Từ đó công ty có sự hỗ trợ trở lại đối với nhân viên.',
                'logo' => 'https://images.careerbuilder.vn/employers/10451/136x136/93152logotcb_1200x1200-min.png',
                'image' => 'https://images.careerbuilder.vn/employers/10451/93125cover-jobportal-career-min.jpg',
                'is_hot' => 1,
                'is_active' => 1
            ],

            [
                'id' => 8,
                'user_id' => 8,
                'name' => 'Tổng Công ty Cổ phần Công trình Viettel',
                'address' => 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội',
                'min_employees' => 5000,
                'max_employees' => 9999,
                'contact_name' => 'Ms.Phương',
                'phone' => '0333333332',
                'website' => 'https://viettelconstruction.com.vn/',
                'description' => 'Tổng Công ty CP Công trình Viettel hoạt động kinh doanh với 6 trụ chính: Đầu tư Hạ tầng, Xây dựng (bao gồm xây dựng hạ tầng viễn thông, xây dựng dân dụng B2C và B2B), Công nghệ thông tin, Giải pháp Tích hợp, Dịch vụ Kỹ thuật và Vận hành Khai thác. Tổng Công ty tâm đắc mang trong mình sứ mệnh đồng hành “Dựng Xây Cuộc Sống Mới” cùng các doanh nghiệp trên cả nước và thế giới.',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot9/219639/136x136/85835202104_logoquychuan.png',
                'image' => 'https://images.careerbuilder.vn/employer_folders/lot9/219639/102456covercb.png',
                'is_hot' => 1,
                'is_active' => 1
            ],

            [
                'id' => 9,
                'user_id' => 9,
                'name' => 'Công Ty Cổ Phần Eurowindow',
                'address' => 'Số 02 Tôn Thất Tùng, P. Trung Tự, Q. Đống Đa, Hà Nội',
                'min_employees' => 3000,
                'max_employees' => 0,
                'contact_name' => 'Nguyen Tuan Viet',
                'phone' => '0333333333',
                'website' => 'https://www.eurowindow.biz',
                'description' => 'Công ty CP Eurowindow được thành lập ngày 29/08/2002, Eurowindow là nhà cung cấp các giải pháp tổng thể cửa hàng đầu tại Việt Nam. Eurowindow chuyên sản xuất các loại cửa sổ, cửa đi, vách ngăn bằng vật liệu u-PVC cao cấp, có lõi thép gia cường và hộp kính tiêu chuẩn chất lượng Châu Âu. Các sản phẩm của Eurowindow có nhiều ưu điểm nổi bật hơn hẳn các loại cửa làm từ vật liệu truyền thống như gỗ, nhôm về tính cách âm, cách nhiệt, độ bền, khả năng chịu lực cao và không cong vênh, co ngót. Mặc dù mới xuất hiện khoảng 50 năm trở lại đây, sản phẩm này đã được đánh giá cao và sử dụng rộng rãi tại nhiều nước trên thế giới, không chỉ ở Châu Âu mà còn ở các nước Châu Á như Singapore, Trung Quốc, Thái Lan, Malaysia và hiện nay là Việt Nam. Trọng dụng nhân tài và phát triển nguồn nhân lực luôn là một trong những tiêu chí hàng đầu của chúng tôi. “Eurowindow luôn chào đón các nhân tài . Nếu bạn tự tin và muốn khẳng định khả năng của bản thân trong môi trường làm việc chuyên nghiệp và năng động.” Hãy liên hệ với chúng tôi bất cứ lúc nào !',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot4/111334/148x148/114411eu.png',
                'image' => 'https://images.careerbuilder.vn/content/news/1.jpg',
                'is_hot' => 0,
                'is_active' => 1
            ],

            [
                'id' => 10,
                'user_id' => 10,
                'name' => 'CÔNG TY CỔ PHẦN METAWAY HOLDINGS',
                'address' => 'Lô CX01, Khu đô thị Văn Khê, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam',
                'min_employees' => null,
                'max_employees' => null,
                'contact_name' => 'contact_name4',
                'phone' => '0333333334',
                'website' => 'https://metawayholdings.vn/',
                'description' => 'Metaway Holdings là tập đoàn kinh tế số quy mô toàn cầu với định hướng phát triển trên các lĩnh vực trụ cột của xã hội kinh tế số. Chúng tôi tạo ra các nền tảng để hoàn thiện hệ sinh thái đa giá trị: Chăm sóc sức khỏe số, Giáo dục số, Thương mại số, Ngân hàng số, Bảo hiểm số, Bất động sản số… Tất cả đều dựa trên việc ứng dụng tối ưu các công nghệ tiên tiến để phục vụ tốt hơn nhu cầu kết nối toàn cầu.

            Với định hướng phát triển các lĩnh vực trụ cột của nền kinh tế, hướng tới xã hội số, Metaway Holdings kiến tạo các nền tảng để hình thành nên các trụ cột của nền kinh tế số bao gồm: Y tế số, giáo dục số, thương mại số, ngân hàng số, bảo hiểm số, bất động sản số… dựa trên việc áp dụng tối đa các công nghệ mới nhất để phụng sự và đáp ứng những nhu cầu kết nối của công dân toàn cầu.

            Metaway Holdings sở hữu nguồn lực mạnh mẽ từ con người, tài chính đến công nghệ. Những người sáng lập và đội ngũ điều hành của Metaway Holdings có nhiều năm kinh nghiệm về chiến lược, quản trị doanh nghiệp, đầu tư, tái cấu trúc và am hiểu các công thức thành công bậc nhất trên thế giới.',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot9/264429/148x148/115827logo_meta_512px.png',
                'image' => 'https://images.careerbuilder.vn/employer_folders/lot9/264429/1158271.jpg',
                'is_hot' => 1,
                'is_active' => 1
            ],

            [
                'id' => 11,
                'user_id' => 11,
                'name' => 'CÔNG TY TNHH COWAY VINA',
                'address' => 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội',
                'min_employees' => 100,
                'max_employees' => 499,
                'contact_name' => 'contact_name1',
                'phone' => '0333333331',
                'website' => 'http://cowayvina.com.vn',
                'description' => 'Coway Việt Nam là pháp nhân tại Việt Nam của công ty Coway có trụ sở tại Hàn Quốc. Chúng tôi chính thức vào thị trường Việt Nam năm 2020 với tư cách pháp nhân độc lập. Sản phẩm chủ đạo của chúng tôi là máy lọc nước và máy lọc không khí thương hiệu số 1 Hàn Quốc. Chúng tôi tự hào đóng góp phần lớn vào việc đem lại chất lượng cuộc sống trong sạch, bảo vệ sức khỏe người dùng. Chất lượng máy lọc nước và máy lọc không khí Coway đã được chứng nhận bằng việc sản phẩm Coway chiếm thị phần số 1 Hàn Quốc và Malaysia.

            Để đáp ứng nhu cầu mở rộng kinh doanh, Coway Vina cần tuyển dụng rất nhiều vị trí hấp dẫn. Coway Vina cam kết đem lại môi trường làm việc chuyên nghiệp và thân thiện cho nhân viên',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot7/245427/148x148/112822logo.jpg',
                'image' => 'https://images.careerbuilder.vn/employer_folders/lot7/245427/104838673cba7d136be135b87a.jpg',
                'is_hot' => 1,
                'is_active' => 1
            ],

            [
                'id' => 12,
                'user_id' => 12,
                'name' => 'CÔNG TY CỔ PHẦN VISCOM',
                'address' => '62 Nguyễn Trường Tộ, Phường 13, Quận 4, TP. HCM',
                'min_employees' => null,
                'max_employees' => null,
                'contact_name' => 'Ms. Đông',
                'phone' => '0333333336',
                'website' => 'http://www.viscom.vn',
                'description' => 'Được thành lập và điều hành bởi những người đam mê và giàu kinh nghiệm về CNTT và Viễn thông nhưng Viscom vẫn liên tục cải tiến, đổi mới để tăng sức cạnh tranh và phục vụ Khách hàng và người tiêu dùng ngày càng tốt hơn. Viscom là Công ty tiên phong trong việc thực hiện chính sách bảo hành đổi ngay cho người tiêu dùng cho rất nhiều dòng sản phẩm. Được Khách hàng và người tiêu dùng đánh giá rất cao.

            Đến nay Viscom đã có chặng đường 16 năm kinh nghiệm. Hiện nay chúng tôi đã có hơn 1.000 Đại lý bán lẻ, các siêu thị điện máy, máy tính, các Công ty máy tính thương hiệu, các Công ty dự án, các Công ty Viễn thông. Hệ thống Đại lý có mặt trên 63 tỉnh thành tại Việt Nam.

            Sản phẩm mà Viscom đang phân phối đều là các hãng nổi tiếng và đã khẳng định được vị thế trên thị trường thế giới - một yêu cầu đầu tiên trong việc chọn sản phẩm phù hợp để cung cấp cho thị trường Việt Nam.',
                'logo' => 'https://images.careerbuilder.vn/employers/62360/136x136/829573481_logo_logo1999834398.jpg',
                'image' => 'https://images.careerbuilder.vn/content/news/1.jpg',
                'is_hot' => 0,
                'is_active' => 1
            ],

            [
                'id' => 13,
                'user_id' => 13,
                'name' => 'Tổng Công Ty Chuyển Phát Nhanh Bưu Điện',
                'address' => 'Tầng 4, tòa nhà FLC Landmark Tower, Ngõ 5 Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm',
                'min_employees' => 1000,
                'max_employees' => 4999,
                'contact_name' => 'Bùi Tuấn Nghĩa',
                'phone' => '0333333337',
                'website' => 'http://ems.com.vn/',
                'description' => 'Tổng công ty Chuyển phát nhanh Bưu điện - CTCP đã được thành lập vào ngày 24/01/2005. Với gần 2.300 CBCNV tại Hà Nội, Đà Nẵng, TP. Hồ Chí Minh và các nhân viên kinh doanh tại một số thị trường trọng điểm trên toàn mạng lưới, Tổng công ty đã xây dựng được nguồn nhân lực chất lượng cao, tinh thông nghiệp vụ, giàu kinh nghiệm và nhiệt huyết với nghề.',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot3/190883/136x136/145650logo2020.jpg',
                'image' => 'https://images.careerbuilder.vn/employer_folders/lot3/190883/18413222e15f6617c1ea9fb3d0.jpg',
                'is_hot' => 0,
                'is_active' => 1
            ],

            [
                'id' => 14,
                'user_id' => 14,
                'name' => 'CÔNG TY TNHH INFOPLUS',
                'address' => 'Tầng 17, Tòa nhà IDMC Mỹ Đình, số 15 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội',
                'min_employees' => 100,
                'max_employees' => 499,
                'contact_name' => 'Ms.Dương',
                'phone' => '0333333338',
                'website' => 'https://infoplusvn.com/',
                'description' => 'Infoplus is a financial API specialist company that supports automated financial services.
            Based on Vietnam\'s first automatic financial system, We provide an automated banking service to connect with companies and individuals.
            We are creating financial innovation in Vietnam\'s digital economy through specialized financial IT technology.

            Our Strength:
            1. Experts Group:
            -   The experts’ group with more than 15years of IT experience in the financial field
            -   Support optimized financial API services for consumer financial business
            2. Services:
            -   Support customized Fintech services such as ERP and BMS to e-commerce, e wallet, and Tel corp. with a customer financial database.',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot1/259301/136x136/223536logo.png',
                'image' => 'https://images.careerbuilder.vn/employer_folders/lot1/259301/112059z3955788243583_9d776633691b479180b4ca7506345eae.jpg',
                'is_hot' => 1,
                'is_active' => 1
            ],

            [
                'id' => 15,
                'user_id' => 15,
                'name' => 'Ngân Hàng TMCP Quân Đội',
                'address' => 'MB Tower, 18 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội',
                'min_employees' => null,
                'max_employees' => null,
                'contact_name' => 'Phòng tuyển dụng',
                'phone' => '0333333339',
                'website' => 'https://www.mbbank.com.vn/',
                'description' => 'MB là một định chế vững về tài chính, mạnh về quản lý, minh bạch về thông tin, thuận tiện và tiên phong trong cung cấp dịch vụ để thực hiện được sứ mệnh của mình, là một tổ chức, một đối tác Vững vàng, tin cậy.

            Trong suốt quá trình hình thành và phát triển, dưới sự lãnh đạo, chỉ đạo của Quân ủy Trung ương - Bộ Quốc phòng, Ngân hàng nhà nước và sự hỗ trợ, giúp đỡ tận tình của các cơ quan hữu quan; đơn vị trong và ngoài quân đội; Ngân hàng TMCP Quân Đội (MB) đã phát huy bản chất tốt đẹp và truyền thống vẻ vang của người chiến sỹ trên mặt trận kinh tế; đoàn kết, chủ động, sáng tạo, tự lực, tự cường, khắc phục khó khăn, cải tiến chất lượng hoạt động đưa các sản phẩm dịch vụ Ngân hàng tốt nhất đến với các cá nhân, tổ chức kinh tế, các doanh nghiệp trên khắp các tỉnh, thành trọng điểm của cả nước, góp phần đẩy mạnh công cuộc phát triển kinh tế của Việt Nam nói chung và nâng cao hiệu quả kinh doanh của ngành Ngân hàng nói riêng.',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot0/99440/136x136/134506mb-logo-main-01.png',
                'image' => 'https://images.careerbuilder.vn/employer_folders/lot0/99440/185944anhbialinkedinpage-01-01.png',
                'is_hot' => 0,
                'is_active' => 1
            ],

            [
                'id' => 16,
                'user_id' => 16,
                'name' => 'CÔNG TY CỔ PHẦN CÔNG NGHỆ CITEK',
                'address' => 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam',
                'min_employees' => null,
                'max_employees' => null,
                'contact_name' => 'Ms.Uyên',
                'phone' => '0333333310',
                'website' => 'https://www.citek.vn/',
                'description' => 'Citek Technology JSC is an enterprise that consults and deploys many comprehensive sets of digital transformation solutions ERP (SAP & Oracle Netsuite), MES, Data Collection, CRM, Data warehouse, Business planning, Business Intelligence as well as develops Web applications and Mobile applications.

            We have been trusted by global companies and leading domestic companies such as Hoa Phat Group, Cadivi Power Cable, Eurowindow, Gelex Electric, Hoa Binh Minh Group, Phenikaa Group, Vicostone, Group THP Group, Quan Dat, BIO, VAS Steel, Minh Phu Seafood, Hainan Seafood, Rang Dong Plastic, SMC Steel, Ton Nam Kim, Nanogen Pharmaceutical, Mainetti, Gia Hoa, PVCFC, Big C, Novaland, Diana-Uncharm, Maison, United Paint Group, Nippon Paint, Honda Vietnam, Mitsubishi Electric, Ajinomoto, BSI, Puratos, Clariant, Relats, Cho Lon Electronics, Fulbright University, Adidas.

            With important contributions in the field of Digital Transformation, recently, Citek has been honored at TOP 10 VIETNAM IT ENTERPRISE Awards 2021 and SAO KHUE Awards 2021. Besides, Citek is also the only partner in Vietnam which was honored by SAP as SAP S/4HANA Partner of The Year 2020, SAP Asia Pacific\'s fastest growing partner in 2019.',
                'logo' => 'https://images.careerbuilder.vn/employer_folders/lot6/253886/136x136/163706logo-2x.png',
                'image' => 'https://images.careerbuilder.vn/content/news/1.jpg',
                'is_hot' => 0,
                'is_active' => 1
            ],

        ]);
    }
}
