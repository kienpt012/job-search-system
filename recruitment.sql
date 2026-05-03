-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 22, 2024 at 06:09 AM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `recruitment`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `organization` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_present` tinyint(1) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `firstname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` tinyint(3) UNSIGNED DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `phone` char(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objective` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `candidates`
--

INSERT INTO `candidates` (`id`, `user_id`, `firstname`, `lastname`, `gender`, `dob`, `phone`, `email`, `address`, `link`, `objective`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 1, 'van phu', 'tran', 0, '2001-01-08', '0333333331', 'phu@gmail.com', 'Gia Lâm, Hà Nội', 'kkk', 'muc tieu', 'avatar.jpg', NULL, NULL),
(2, 2, 'thoa', 'ngo', 1, '2002-02-09', '0333333332', 'thoa@gmail.com', 'Ân Thi, Hưng Yên', 'kkk', 'muc tieu', 'avatar.jpg', NULL, NULL),
(3, 3, 'ngoc diep', 'nguyen', 1, '2005-02-17', '0333333333', 'diep@gmail.com', 'Chương Mỹ, Hà Nội', 'kkk', 'muc tieu', 'avatar.jpg', NULL, NULL),
(4, 4, 'thanh phong', 'bui', 0, '2001-03-10', '0333333334', 'phong@gmail.com', 'Đống Đa, Hà Nội', 'kkk', 'muc tieu', 'avatar.jpg', NULL, NULL),
(17, 17, 'hong quang', 'tran', 0, '2000-03-12', '0333333335', 'quang@gmail.com', 'Hai Bà Trưng, Hà Nội', 'kkk', 'muc tieu', 'avatar.jpg', NULL, NULL),
(18, 18, 'nnnnnn', 'kkk', 0, '2024-03-13', '0364877525', 'dothanhnhan20k@gmail.com', 'uuuu ggg', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s', 'fsdfsdf', 'http://localhost:8000/storage/avatar_images/avatar_candidate__18', '2024-03-20 15:20:35', '2024-03-20 15:37:11'),
(19, 19, 'demo2', 'kkk', 1, '2024-03-02', '0364877525', 'dothanhnhan20k@gmail.com', 'uuuu ggg', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s', 'axxxxxxxxxxxxx', 'http://localhost:8000/storage/avatar_images/avatar_candidate__19', '2024-03-21 09:07:26', '2024-03-21 09:08:45'),
(20, 20, 'demoweb', 'demoweb', 1, '2024-03-15', '0987666642', 'demoweb@gmail.com', 'khu pho 3 an phu quan 2', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s', 'abcdef...................', 'http://localhost:8000/storage/avatar_images/avatar_candidate__20', '2024-03-21 11:18:05', '2024-03-21 11:19:41');

-- --------------------------------------------------------

--
-- Table structure for table `candidate_messages`
--

CREATE TABLE `candidate_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `educations`
--

CREATE TABLE `educations` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `school` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `major` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `educations`
--

INSERT INTO `educations` (`candidate_id`, `school`, `major`, `start_date`, `end_date`, `description`) VALUES
(18, 'dsaasd', 'ádasd', '2024-03-14', '2024-03-23', 'ádasd'),
(20, 'tin hoc', 'cntt', '2024-02-29', '2024-03-23', 'abcd...');

-- --------------------------------------------------------

--
-- Table structure for table `employers`
--

CREATE TABLE `employers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `min_employees` int(10) UNSIGNED DEFAULT NULL,
  `max_employees` int(10) UNSIGNED DEFAULT NULL,
  `contact_name` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_hot` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employers`
--

INSERT INTO `employers` (`id`, `user_id`, `name`, `address`, `min_employees`, `max_employees`, `contact_name`, `phone`, `website`, `description`, `logo`, `image`, `is_hot`, `is_active`, `created_at`, `updated_at`) VALUES
(5, 5, 'TECHCOMBANK', 'HO Miền Bắc: Số 6 Quang Trung, phường Trần Hưng Đạo, Quận Hoàn Kiếm, Thành phố Hà Nội\n                HO Miền Nam: Số 23 Lê Duẩn, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', 10, 150, 'Khối Quản Trị Nguồn Nhân Lực', '0333333331', 'https://techcombank.com/', 'Lĩnh vực kinh doanh là viễn thông và các dịch vụ Giá trị gia tăng. Với tiêu chí hàng đầu là coi trọng giá trị nguồn nhân lực, công ty luôn hướng tới việc tạo điều kiện làm việc tốt nhất cho nhân viên để phát huy hết khả năng, tạo ra giá trị lớn cho công ty. Từ đó công ty có sự hỗ trợ trở lại đối với nhân viên.', 'https://images.careerbuilder.vn/employers/10451/136x136/93152logotcb_1200x1200-min.png', 'https://images.careerbuilder.vn/employers/10451/93125cover-jobportal-career-min.jpg', 1, 1, NULL, NULL),
(8, 8, 'Tổng Công ty Cổ phần Công trình Viettel', 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội', 5000, 9999, 'Ms.Phương', '0333333332', 'https://viettelconstruction.com.vn/', 'Tổng Công ty CP Công trình Viettel hoạt động kinh doanh với 6 trụ chính: Đầu tư Hạ tầng, Xây dựng (bao gồm xây dựng hạ tầng viễn thông, xây dựng dân dụng B2C và B2B), Công nghệ thông tin, Giải pháp Tích hợp, Dịch vụ Kỹ thuật và Vận hành Khai thác. Tổng Công ty tâm đắc mang trong mình sứ mệnh đồng hành “Dựng Xây Cuộc Sống Mới” cùng các doanh nghiệp trên cả nước và thế giới.', 'https://images.careerbuilder.vn/employer_folders/lot9/219639/136x136/85835202104_logoquychuan.png', 'https://images.careerbuilder.vn/employer_folders/lot9/219639/102456covercb.png', 1, 1, NULL, NULL),
(9, 9, 'Công Ty Cổ Phần Eurowindow', 'Số 02 Tôn Thất Tùng, P. Trung Tự, Q. Đống Đa, Hà Nội', 3000, 0, 'Nguyen Tuan Viet', '0333333333', 'https://www.eurowindow.biz', 'Công ty CP Eurowindow được thành lập ngày 29/08/2002, Eurowindow là nhà cung cấp các giải pháp tổng thể cửa hàng đầu tại Việt Nam. Eurowindow chuyên sản xuất các loại cửa sổ, cửa đi, vách ngăn bằng vật liệu u-PVC cao cấp, có lõi thép gia cường và hộp kính tiêu chuẩn chất lượng Châu Âu. Các sản phẩm của Eurowindow có nhiều ưu điểm nổi bật hơn hẳn các loại cửa làm từ vật liệu truyền thống như gỗ, nhôm về tính cách âm, cách nhiệt, độ bền, khả năng chịu lực cao và không cong vênh, co ngót. Mặc dù mới xuất hiện khoảng 50 năm trở lại đây, sản phẩm này đã được đánh giá cao và sử dụng rộng rãi tại nhiều nước trên thế giới, không chỉ ở Châu Âu mà còn ở các nước Châu Á như Singapore, Trung Quốc, Thái Lan, Malaysia và hiện nay là Việt Nam. Trọng dụng nhân tài và phát triển nguồn nhân lực luôn là một trong những tiêu chí hàng đầu của chúng tôi. “Eurowindow luôn chào đón các nhân tài . Nếu bạn tự tin và muốn khẳng định khả năng của bản thân trong môi trường làm việc chuyên nghiệp và năng động.” Hãy liên hệ với chúng tôi bất cứ lúc nào !', 'https://images.careerbuilder.vn/employer_folders/lot4/111334/148x148/114411eu.png', 'https://images.careerbuilder.vn/content/news/1.jpg', 0, 1, NULL, NULL),
(10, 10, 'CÔNG TY CỔ PHẦN METAWAY HOLDINGS', 'Lô CX01, Khu đô thị Văn Khê, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam', NULL, NULL, 'contact_name4', '0333333334', 'https://metawayholdings.vn/', 'Metaway Holdings là tập đoàn kinh tế số quy mô toàn cầu với định hướng phát triển trên các lĩnh vực trụ cột của xã hội kinh tế số. Chúng tôi tạo ra các nền tảng để hoàn thiện hệ sinh thái đa giá trị: Chăm sóc sức khỏe số, Giáo dục số, Thương mại số, Ngân hàng số, Bảo hiểm số, Bất động sản số… Tất cả đều dựa trên việc ứng dụng tối ưu các công nghệ tiên tiến để phục vụ tốt hơn nhu cầu kết nối toàn cầu.\n\n            Với định hướng phát triển các lĩnh vực trụ cột của nền kinh tế, hướng tới xã hội số, Metaway Holdings kiến tạo các nền tảng để hình thành nên các trụ cột của nền kinh tế số bao gồm: Y tế số, giáo dục số, thương mại số, ngân hàng số, bảo hiểm số, bất động sản số… dựa trên việc áp dụng tối đa các công nghệ mới nhất để phụng sự và đáp ứng những nhu cầu kết nối của công dân toàn cầu.\n\n            Metaway Holdings sở hữu nguồn lực mạnh mẽ từ con người, tài chính đến công nghệ. Những người sáng lập và đội ngũ điều hành của Metaway Holdings có nhiều năm kinh nghiệm về chiến lược, quản trị doanh nghiệp, đầu tư, tái cấu trúc và am hiểu các công thức thành công bậc nhất trên thế giới.', 'https://images.careerbuilder.vn/employer_folders/lot9/264429/148x148/115827logo_meta_512px.png', 'https://images.careerbuilder.vn/employer_folders/lot9/264429/1158271.jpg', 1, 1, NULL, NULL),
(11, 11, 'CÔNG TY TNHH COWAY VINA', 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội', 100, 499, 'contact_name1', '0333333331', 'http://cowayvina.com.vn', 'Coway Việt Nam là pháp nhân tại Việt Nam của công ty Coway có trụ sở tại Hàn Quốc. Chúng tôi chính thức vào thị trường Việt Nam năm 2020 với tư cách pháp nhân độc lập. Sản phẩm chủ đạo của chúng tôi là máy lọc nước và máy lọc không khí thương hiệu số 1 Hàn Quốc. Chúng tôi tự hào đóng góp phần lớn vào việc đem lại chất lượng cuộc sống trong sạch, bảo vệ sức khỏe người dùng. Chất lượng máy lọc nước và máy lọc không khí Coway đã được chứng nhận bằng việc sản phẩm Coway chiếm thị phần số 1 Hàn Quốc và Malaysia.\n\n            Để đáp ứng nhu cầu mở rộng kinh doanh, Coway Vina cần tuyển dụng rất nhiều vị trí hấp dẫn. Coway Vina cam kết đem lại môi trường làm việc chuyên nghiệp và thân thiện cho nhân viên', 'https://images.careerbuilder.vn/employer_folders/lot7/245427/148x148/112822logo.jpg', 'https://images.careerbuilder.vn/employer_folders/lot7/245427/104838673cba7d136be135b87a.jpg', 1, 1, NULL, NULL),
(12, 12, 'CÔNG TY CỔ PHẦN VISCOM', '62 Nguyễn Trường Tộ, Phường 13, Quận 4, TP. HCM', NULL, NULL, 'Ms. Đông', '0333333336', 'http://www.viscom.vn', 'Được thành lập và điều hành bởi những người đam mê và giàu kinh nghiệm về CNTT và Viễn thông nhưng Viscom vẫn liên tục cải tiến, đổi mới để tăng sức cạnh tranh và phục vụ Khách hàng và người tiêu dùng ngày càng tốt hơn. Viscom là Công ty tiên phong trong việc thực hiện chính sách bảo hành đổi ngay cho người tiêu dùng cho rất nhiều dòng sản phẩm. Được Khách hàng và người tiêu dùng đánh giá rất cao.\n\n            Đến nay Viscom đã có chặng đường 16 năm kinh nghiệm. Hiện nay chúng tôi đã có hơn 1.000 Đại lý bán lẻ, các siêu thị điện máy, máy tính, các Công ty máy tính thương hiệu, các Công ty dự án, các Công ty Viễn thông. Hệ thống Đại lý có mặt trên 63 tỉnh thành tại Việt Nam.\n\n            Sản phẩm mà Viscom đang phân phối đều là các hãng nổi tiếng và đã khẳng định được vị thế trên thị trường thế giới - một yêu cầu đầu tiên trong việc chọn sản phẩm phù hợp để cung cấp cho thị trường Việt Nam.', 'https://images.careerbuilder.vn/employers/62360/136x136/829573481_logo_logo1999834398.jpg', 'https://images.careerbuilder.vn/content/news/1.jpg', 0, 1, NULL, NULL),
(13, 13, 'Tổng Công Ty Chuyển Phát Nhanh Bưu Điện', 'Tầng 4, tòa nhà FLC Landmark Tower, Ngõ 5 Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm', 1000, 4999, 'Bùi Tuấn Nghĩa', '0333333337', 'http://ems.com.vn/', 'Tổng công ty Chuyển phát nhanh Bưu điện - CTCP đã được thành lập vào ngày 24/01/2005. Với gần 2.300 CBCNV tại Hà Nội, Đà Nẵng, TP. Hồ Chí Minh và các nhân viên kinh doanh tại một số thị trường trọng điểm trên toàn mạng lưới, Tổng công ty đã xây dựng được nguồn nhân lực chất lượng cao, tinh thông nghiệp vụ, giàu kinh nghiệm và nhiệt huyết với nghề.', 'https://images.careerbuilder.vn/employer_folders/lot3/190883/136x136/145650logo2020.jpg', 'https://images.careerbuilder.vn/employer_folders/lot3/190883/18413222e15f6617c1ea9fb3d0.jpg', 0, 1, NULL, NULL),
(14, 14, 'CÔNG TY TNHH INFOPLUS', 'Tầng 17, Tòa nhà IDMC Mỹ Đình, số 15 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội', 100, 499, 'Ms.Dương', '0333333338', 'https://infoplusvn.com/', 'Infoplus is a financial API specialist company that supports automated financial services.\n            Based on Vietnam\'s first automatic financial system, We provide an automated banking service to connect with companies and individuals.\n            We are creating financial innovation in Vietnam\'s digital economy through specialized financial IT technology.\n\n            Our Strength:\n            1. Experts Group:\n            -   The experts’ group with more than 15years of IT experience in the financial field\n            -   Support optimized financial API services for consumer financial business\n            2. Services:\n            -   Support customized Fintech services such as ERP and BMS to e-commerce, e wallet, and Tel corp. with a customer financial database.', 'https://images.careerbuilder.vn/employer_folders/lot1/259301/136x136/223536logo.png', 'https://images.careerbuilder.vn/employer_folders/lot1/259301/112059z3955788243583_9d776633691b479180b4ca7506345eae.jpg', 1, 1, NULL, NULL),
(15, 15, 'Ngân Hàng TMCP Quân Đội', 'MB Tower, 18 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội', NULL, NULL, 'Phòng tuyển dụng', '0333333339', 'https://www.mbbank.com.vn/', 'MB là một định chế vững về tài chính, mạnh về quản lý, minh bạch về thông tin, thuận tiện và tiên phong trong cung cấp dịch vụ để thực hiện được sứ mệnh của mình, là một tổ chức, một đối tác Vững vàng, tin cậy.\n\n            Trong suốt quá trình hình thành và phát triển, dưới sự lãnh đạo, chỉ đạo của Quân ủy Trung ương - Bộ Quốc phòng, Ngân hàng nhà nước và sự hỗ trợ, giúp đỡ tận tình của các cơ quan hữu quan; đơn vị trong và ngoài quân đội; Ngân hàng TMCP Quân Đội (MB) đã phát huy bản chất tốt đẹp và truyền thống vẻ vang của người chiến sỹ trên mặt trận kinh tế; đoàn kết, chủ động, sáng tạo, tự lực, tự cường, khắc phục khó khăn, cải tiến chất lượng hoạt động đưa các sản phẩm dịch vụ Ngân hàng tốt nhất đến với các cá nhân, tổ chức kinh tế, các doanh nghiệp trên khắp các tỉnh, thành trọng điểm của cả nước, góp phần đẩy mạnh công cuộc phát triển kinh tế của Việt Nam nói chung và nâng cao hiệu quả kinh doanh của ngành Ngân hàng nói riêng.', 'https://images.careerbuilder.vn/employer_folders/lot0/99440/136x136/134506mb-logo-main-01.png', 'https://images.careerbuilder.vn/employer_folders/lot0/99440/185944anhbialinkedinpage-01-01.png', 0, 1, NULL, NULL),
(16, 16, 'CÔNG TY CỔ PHẦN CÔNG NGHỆ CITEK', 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam', NULL, NULL, 'Ms.Uyên', '0333333310', 'https://www.citek.vn/', 'Citek Technology JSC is an enterprise that consults and deploys many comprehensive sets of digital transformation solutions ERP (SAP & Oracle Netsuite), MES, Data Collection, CRM, Data warehouse, Business planning, Business Intelligence as well as develops Web applications and Mobile applications.\n\n            We have been trusted by global companies and leading domestic companies such as Hoa Phat Group, Cadivi Power Cable, Eurowindow, Gelex Electric, Hoa Binh Minh Group, Phenikaa Group, Vicostone, Group THP Group, Quan Dat, BIO, VAS Steel, Minh Phu Seafood, Hainan Seafood, Rang Dong Plastic, SMC Steel, Ton Nam Kim, Nanogen Pharmaceutical, Mainetti, Gia Hoa, PVCFC, Big C, Novaland, Diana-Uncharm, Maison, United Paint Group, Nippon Paint, Honda Vietnam, Mitsubishi Electric, Ajinomoto, BSI, Puratos, Clariant, Relats, Cho Lon Electronics, Fulbright University, Adidas.\n\n            With important contributions in the field of Digital Transformation, recently, Citek has been honored at TOP 10 VIETNAM IT ENTERPRISE Awards 2021 and SAO KHUE Awards 2021. Besides, Citek is also the only partner in Vietnam which was honored by SAP as SAP S/4HANA Partner of The Year 2020, SAP Asia Pacific\'s fastest growing partner in 2019.', 'https://images.careerbuilder.vn/employer_folders/lot6/253886/136x136/163706logo-2x.png', 'https://images.careerbuilder.vn/content/news/1.jpg', 0, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employer_location`
--

CREATE TABLE `employer_location` (
  `employer_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employer_location`
--

INSERT INTO `employer_location` (`employer_id`, `location_id`) VALUES
(5, 24),
(5, 29),
(8, 24),
(9, 24),
(10, 24),
(11, 24),
(12, 29),
(13, 24),
(14, 24),
(15, 24),
(16, 29);

-- --------------------------------------------------------

--
-- Table structure for table `experiences`
--

CREATE TABLE `experiences` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `jtype_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `industries`
--

CREATE TABLE `industries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `industries`
--

INSERT INTO `industries` (`id`, `name`) VALUES
(1, 'Ngân hàng'),
(2, 'CNTT-Phần mềm'),
(3, 'CNTT-Phần cứng / Mạng'),
(4, 'Tiếp thị trực tuyến'),
(5, 'Tài chính / Đầu tư'),
(6, 'Kiến trúc'),
(7, 'Mỹ thuật / Nghệ thuật / Thiết kế'),
(8, 'Bưu chính viễn thông'),
(9, 'Nhân sự'),
(10, 'Lao động phổ thông'),
(11, 'Bán hàng / Kinh doanh'),
(12, 'Dược phẩm'),
(13, 'Hành chính / Thư ký'),
(14, 'Tiếp thị / Marketing'),
(15, 'Vận chuyển / Giao nhận / Kho vận'),
(16, 'Tư vấn');

-- --------------------------------------------------------

--
-- Table structure for table `jlevels`
--

CREATE TABLE `jlevels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jlevels`
--

INSERT INTO `jlevels` (`id`, `name`) VALUES
(1, 'Thực tập sinh'),
(2, 'Nhân viên'),
(3, 'Trưởng nhóm/Giám sát'),
(4, 'Quản lý'),
(5, 'Quản lý cấp cao'),
(6, 'Điều hành cấp cao');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employer_id` bigint(20) UNSIGNED NOT NULL,
  `jtype_id` bigint(20) UNSIGNED NOT NULL,
  `jlevel_id` bigint(20) UNSIGNED NOT NULL,
  `jname` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int(10) UNSIGNED DEFAULT NULL,
  `min_salary` int(10) UNSIGNED DEFAULT NULL,
  `max_salary` int(10) UNSIGNED DEFAULT NULL,
  `yoe` tinyint(3) UNSIGNED DEFAULT NULL,
  `gender` tinyint(3) UNSIGNED DEFAULT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_at` date NOT NULL,
  `is_hot` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `employer_id`, `jtype_id`, `jlevel_id`, `jname`, `address`, `amount`, `min_salary`, `max_salary`, `yoe`, `gender`, `description`, `expire_at`, `is_hot`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 4, 'Project Manager', 'Số 6 Quang Trung, phường Trần Hưng Đạo, Quận Hoàn Kiếm, Thành phố Hà Nội', 5, NULL, NULL, 8, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Job Purpose\n\n                - The job holder leads portfolio management by providing support in planning, coordination of financial objectives and deliverables for the portfolio of both traditional projects/initiatives implemented through Waterfall methodology and customer journey digitization initiatives implemented through Agile methodology.\n\n                - The job holder collaborates with cross-functional teams within the Transformation Office and other divisions in the bank to ensure operational consistency across bank-wide initiatives in tracking and governing progress, managing resources and communicating with stakeholders.\n\n                Key Accountabilities (1)\n\n                A. Operations Support and Governance\n\n                - Design the operational process across the initiative lifecycle to ensure standartized approach across all type of initiatives/projects.\n\n                - Update operational processes on a regular basis and facilitate the set up of new initiatives and tribes in accordance with required standards.\n\n                - Support the development of tools/templates and guide initiative teams on how to fill in and update initiative progress on the tools/templates created.\n\n                - Apply and maintain tools/templates used to track and report across the portfolio of transformation initiatives (Foundational and Agile), define monitoring tools/templates and customize as needed.\n\n                - Provide logistics support for Head of IPMO and the team, CEO workshops, governance meetings, and be the contact point for building the Agile working environment for the Transformation Office.\n\n                - Consolidate and prepare progress reports for STEERCO, TECO, BOM, BOD leadership committees timely and accurately.\n\n                Key Accountabilities (2)\n\n                B. Resource Management\n\n                - Collaborate with stakeholders in Business Units / Divisions to identify high level resource planning requirements to ensure optimal resource utilization.\n\n                - Track and control resource usage efficiency to ensure sufficiency for all units in the Transformation Office and for bank-wide initiatives within approved plan.\n\n                Key Accountabilities (3)\n\n                C. Portfolio Management\n\n                - Work with transformation initiative leads and teams to understand progress of their assigned portfolio and track the accuracy of inputs for tools.\n\n                - Work with initiative leads to change initiative status and solve problems as required, report key challenges, track progress, recognize financial values and manage use of monitoring tools.\n\n                - Proactively guide initiative teams, Business Units and Divisions for effective cross-functional collaboration.\n\n                - Control quality and compliance of initiatives with required standards.\n\n                - Escalate issues or risks of potential impact on performance via portfolio reporting to Sponsors / STEERCO / TECO committees to facilitate the decision making process.\n\n                - Support the iPMO Lead in developing Early Warning System (EWS).\n\n                YÊU CẦU CÔNG VIỆC\n                Success Profile - Qualification and Experiences\n\n                -  At least 8 years of project or program management experience in Waterfall or Agile methodologies\n\n                -  Project or program management experience in a bank or technology organization including banking product development, performance management, IT project implementation\n\n                -  Demonstrated experience working in a transformation office to drive a large organization-wide transformation program\n\n                -  Strong experience in performance tracking and management including operating rhythm of performance reviews\n\n                -  Strong knowledge and experience in blending traditional project management principles and practices with an Agile development approach in the right proportions to fit large, complex, mission-critical, enterprise-level projects\n\n                -  Bachelor’s or Master&#039;s degree in Technology, Business, Banking and Finance or relevant discipline\n\n                -  Project management certification in PMP, PgMP will be advantageous', '2024-08-31', 1, 1, '2023-07-20 02:05:00', NULL),
(2, 5, 1, 2, 'Digital Customer Experience Advisor', 'Số 23 Lê Duẩn, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', 5, 14, 17, NULL, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Responsibilities include but are not limited to:\n                - Advise customers on financial services (bond, fund, stock and TCBS particular products).\n                - Build and implement campaigns (loyalty, minigames…) to have a flexible approach to customer needs.\n                - Analyze, propose, implement and optimize the customer journey\n                - Handle and solve all customer requests, complains via phones, livechat, facebook, face to face ...\n                - Create and maintain the knowledge base on TCBS website, iWealth Club (video, infographic, gif, story...)\n                - Research customer pain points and propose innovative solutions, translating and teaching AI chatbot\n                - Generate related power BI reports\n\n                YÊU CẦU CÔNG VIỆC\n                - University degree or above at top 1 Vietnam University (foreign trade, banking, economics).\n                - IT savvy (Python, Power BI, Data Analyst...), design motion graphics, infographic, create video.\n                - Ielts above 6.0.\n                - Patience and problem-solving ability.\n                - Customer-oriented attitude.\n                - Outstanding communication skills.', '2024-08-31', 0, 1, '2023-07-19 02:05:00', NULL),
(3, 5, 1, 2, 'HCM - Senior Angular Developer', 'Số 23 Lê Duẩn, phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh', 5, NULL, NULL, 5, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Responsibilities:\n\n                A. Software Development\n\n                - Drive and deliver top quality HTML, CSS, JQuery and JavaScript user interface code on a wide range of interactive web projects.\n\n                -Work closely with UX researchers and UI designers on designing high quality apps.\n\n                - Own the UI code of the digital platform and the architecture of the user experience, leading designers to take the wireframe from development to delivery.\n\n                - Collaborate with back-end developers to troubleshoot and resolve coding issues, improving usability.\n\n                - Ensure that all materials produced are of high quality, accuracy, timeliness and compliance with accessibility standards.\n\n                - Maintain graphic and branding standards throughout the product&#039;s look and feel.\n\n                - Actively test and debug the program to ensure stability and accuracy.\n\n                - Develop and maintain user interface code to improve forecasting methods and statistical and analytical models to assist business tribes in their decision making.\n\n                - Build interfaces and user interfaces for the bank&#039;s digital platforms, ensuring a seamless digital interface from the customer&#039;s point of view.\n\n                - Responsible for the user-facing code of the digital platform and the architecture of the user experience, working closely with the designers to take the wireframe from development to delivery\n\n                - Collaborate with back end developers and UI/UX designers to improve usability.\n\n                - Proactively give suggestions and systematized solutions to influence the design of the platform.\n\n                - Responsible for defining the structure and design of web pages, striking a balance between functional and aesthetic design, and ensuring the web design is optimized for mobile pages.\n\n                - Maintain and constantly improve the developed website and optimize the application for smooth use of the application.\n\n                B. Software Documentation\n\n                - Instruct tribe and team members to translate business requirements into technical design documents.\n\n                - Actively review and foster discussions with team members on functional requirements documents to build and improve TCB&#039;s digital products&quot;\n\n                - Work closely with tribe and squad members to translate business requirements into technical design documents.\n\n                - Review and execute requirements documents by coding flowcharts, layouts, diagrams, charts, code annotations, and instructions for the program.&quot;\n\n                YÊU CẦU CÔNG VIỆC\n                Requirements:\n\n                - Bachelor&#039;s Degree in Computer Science, Software Engineering or Information Technology\n\n                Work Experience\n\n                - At least 5 years of front-end experience developing in HTML/CSS/JavaScript and Angular 8+\n\n                - Experience with tools that leverage UI/UX design and implementation such as Bootstrap\n\n                - Experience working in a source control environment such as GIT or TFVC\n\n                - Experience in the full development lifecycle from requirements analysis through coding and release\n\n                - Deep experience in developing, testing, documenting, and releasing critical software\n\n                - Solid understanding of API design and implementation\n\n                - Experience with Adobe tools, such as Adobe CS, Adobe Illustrator, Adobe Target, etc, is a big plus\n\n                - Good at English is a plus', '2023-08-21', 1, 1, '2023-07-20 02:05:00', NULL),
(4, 8, 1, 2, 'Nhân viên thiết kế UIUX (Designer)', 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội', 5, 15, 25, 3, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                1. Tư vấn, tham mưu cho BGĐ TT CNTT về công tác thiết kế đồ họa UX/UI trong phần mềm\n\n                - Nghiên cứu các phương pháp, tiêu chuẩn thiết kế đồ họa mới trên thế giới, áp dụng vào hệ thống các phần mềm tại Tổng Công ty\n\n                .2. Thiết kế đồ họa UX/UI các sản phẩm phần mềm\n\n                Tư vấn, làm rõ các yêu cầu thiết kế đồ họa\n                Thực hiện thiết kế đồ họa\n                Phối hợp với nhóm phát triển sản phẩm đưa thiết kế vào sản phẩm\n                Phối hợp nghiệm thu sản phẩm\n                YÊU CẦU CÔNG VIỆC\n                Tốt nghiệp đại học trở lên ưu tiên chuyên ngành Thiết kế mỹ thuật hoặc thiết kế đồ họa\n                 Tối thiểu 02 năm kinh nghiệm trở lên làm việc trong lĩnh vực thiết kế đồ họa cho phần mềm\n                Ưu tiên: Có kinh nghiệm trong thiết kế đồ họa UI/UX các ứng dụng mobile, web có nhiều người sử dụng\n                Kiến thức về bố cục, nguyên tắc cơ bản đồ họa, kiểu chữ, in ấn và web\n                 Có kiến thức sâu về HTML và CSS\n                 Kiến thức sâu về Adobe PhotoShop, Illustrator, Sketch, InDesign và các phần mềm thiết kế đồ họa khác\n                Danh mục sản phẩm đã thiết kế có chất lượng cao\n                QUYỀN LỢI:\n\n                Quyền lợi\n\n                Gói phụ cấp 48 triệu hàng năm, có phụ cấp ăn trưa điện thoại: 930.000/tháng.\n                Ăn trưa ngay tại công ty\n                Làm việc từ T2-T6 và ngày T7 đầu tiên của tháng.\n                Được ký hợp đồng lao động và tham gia các loại bảo hiểm theo quy định của Nhà nước.\n                Được đào tạo tại công ty hoặc tham gia các khóa đào tạo nâng cao, bổ ích bên ngoài.\n                Cơ hội tham gia nhiều hoạt động văn hóa, thể dục, thể thao, giải trí.\n                Chính sách du lịch, nghỉ dưỡng, khám sức khỏe định kỳ cho CBNV.', '2023-08-22', 0, 1, '2023-07-19 02:05:00', NULL),
(5, 8, 1, 3, 'Technical Leader', 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội', 5, 32, 60, 5, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                • Quản lý tiến độ làm việc của toàn bộ dự án.\n\n                • Trực tiếp tham gia vào quá trình lập trình phần mềm, tham gia sửa và hoàn thiên, nâng cao chất lượng lập trình (70%)\n                • Phối hợp với các đơn vị nghiệp vụ, báo cáo về tình hình dự án lên các trưởng/phó phòng quản lý trực tiếp, đề xuất các phương án để dự án chạy thông suốt, đảm bảo chất lượng dự án.\n\n                • Lập kế hoạch phát triển dự án, quản trị rủi ro, phân chia công việc, chịu trách nhiệm về dự án trước các đơn vị nghiệp vụ và các hoạt động của dự án.\n                • Thực hiện quản trị dự án, quản lý đầu việc, tiến độ, trạng thái, khối lượng và hiệu suất thực hiện dự án, đánh giá/nhận xét năng lực của thành viên trong dự án.\n                • Nghiên cứu, nghiệm thu và đề xuất thay đổi quy trình sản xuất phần mềm (nếu có).\n\n                YÊU CẦU CÔNG VIỆC\n                • Tốt nghiệp Đại học về chuyên ngành CNTT, Kỹ thuật phần mềm, An toàn thông tin hoặc các ngành có liên quan. Đặc biệt ưu tiên các trường Đại học Bách Khoa, Học viện Công nghệ Bưu chính Viễn thông, Đại học FPT, Đại học Công nghệ - Đại học Quốc gia Hà Nội và các đại học trường top về CNTT.\n                • Có kinh nghiệm ít nhất 02 năm ở vị trí Technical Leader (chính về Java). Ưu tiên các ứng viên có chứng chỉ liên quan tới công nghệ thông tin.\n                • Ưu tiên có kinh nghiệm quản trị các dự án theo nhiều mô hình khác nhau như Agile, Waterfall, PMI.\n                • Thành thạo các công cụ quản trị dự án và kiểm soát rủi ro\n\n                • Bắt buộc: Thành thạo ngôn ngữ lập trình Java và có hiêu biết một chút về các ngôn ngữ khác.\n\n                • Có kiến thức và kinh nghiệm về Solution Architect và Technical Leader\n                • Tư duy logic và tích cực, khả năng giao tiếp tốt, sáng tạo trong công việc\n\n                Quyền lợi\n\n                Thời gian làm việc: 8h00- 17h30 từ thứ 2 tới thứ 6 và một ngày thứ 7 đầu tiên của tháng.\n                Địa điểm làm việc: 219 Trung Kính, Cầu Giấy, Hà Nội.\n                -  Có phụ cấp ăn trưa điện thoại\n\n                - Gói phụ cấp hàng năm tổng 48 triệu/năm\n\n                -  Được ký hợp đồng lao động và tham gia các loại bảo hiểm theo quy định của Nhà nước.\n\n                -  Được đào tạo tại công ty hoặc tham gia các khóa đào tạo nâng cao, bổ ích bên ngoài.\n\n                -  Cơ hội tham gia nhiều hoạt động văn hóa, thể dục, thể thao, giải trí.\n\n                -  Chính sách du lịch, nghỉ dưỡng, khám sức khỏe định kỳ cho CBNV.', '2023-08-20', 1, 0, '2023-07-15 02:05:00', '2024-03-21 11:26:14'),
(6, 8, 1, 3, 'Trưởng nhóm lập trình java', 'Tòa Báo Lao động, Số 6, đường Phạm Văn Bạch, Cầu Giấy, Hà Nội', 5, 25, 40, 4, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                - Lập trình trong các dự án phần mềm sử dụng ngôn ngữ Java trong tổng công ty, bao gồm các sản phẩm phục vụ quản lý điều hành kinh doanh, quản lý bán hàng, chăm sóc khách hàng và quản trị doanh nghiệp (ERP)\n\n                - Thiết kế tổng thể, thiết kế chi tiết (màn hình, api, cơ sở dữ liệu, luồng dữ liệu...) các module chức năng của phần mềm để đảm bảo các tiêu chức năng và phi chức năng (như đáp ứng hiệu năng, tính mở rộng..)\n\n                - Chịu trách nhiệm triển khai và hỗ trợ sau triển khai các phần mềm. Xử lý phản ánh người dùng cuối và sửa các lỗi về tính năng, hiệu năng, kiến trúc của phần mềm.\n\n                - Quản lý nhóm lập trình của một hoặc nhiều sản phẩm, chịu trách nhiệm giao việc, quản lý tiến độ chất lượng công việc của nhóm, báo cáo lên trưởng phòng hoặc ban giám đốc trung tâm. Đào tạo để nâng cap chất lượng nhóm. Nghiên cứu và phát triển công nghệ mới giúp tăng hiệu suất cho dự án.\n\n                YÊU CẦU CÔNG VIỆC\n                - Tốt nghiệp Đại học trở lên chuyên ngành Công nghệ thông tin, hệ thống thông tin, Khoa học máy hoặc ngành liên quan;\n\n                - Có từ 2 năm kinh nghiệm trở lên với các nền tảng và framework công nghệ Java.\n\n                - Nắm vững các kiến thức cơ bản về lập trình hướng đối tượng, lập trình Java core (multithreading, Collection...)  /Java web (J2EE, ORM, Caching...)\n\n                - Có kinh nghiệm thành thạo sử dụng một trong các framework/stack về java đang triển khai tại TCT như sau:\n\n                - Framework: Spring-boot, Spring MVC, Angular, Các web framework java phổ biến khác\n\n                - Midware: Kafka, Redis, CEP, BPMN engine...\n\n                - Cơ sở dữ liệu: Oracle, Postgresql, MariaDB, NoSQL\n\n                - CI/CD devops: Gitlab, Jenkins,\n\n                Ưu tiên\n\n                - Ứng viên đã có kinh nghiệm tại vị trí tương đương tại các công ty phần mềm lớn (outsourcing hoặc Product)\n\n                - Tham gia các dự án opensource lớn với vai trò contributor.\n\n                - Có chứng chỉ về Java hoặc các framework/platform công nghệ Java.\n\n                - Độ tuổi: Dưới 32\n\n                QUYỀN LỢI:\n\n                - Lương tháng : Upto 40.000.000 đồng/ tháng\n\n                - Có phụ cấp ăn trưa điện thoại + Thưởng tháng lương T13\n\n                - Thưởng các ngày lễ tết: 48.000.000TR/năm\n\n                - Nghỉ phép 15 ngày/năm\n\n                - Địa điểm làm việc: 219 Trung Kính, Cầu Giấy, HN\n\n                - Được ký hợp đồng lao động và tham gia các loại bảo hiểm theo quy định của Nhà nước.\n\n                - Được đào tạo tại công ty hoặc tham gia các khóa đào tạo nâng cao, bổ ích bên ngoài.\n\n                - Tham gia nhiều hoạt động văn hóa, thể dục, thể thao, giải trí.\n\n                - Chính sách du lịch, nghỉ dưỡng, khám sức khỏe định kỳ cho CBNV.', '2023-08-21', 0, 1, '2023-07-16 02:05:00', NULL),
(7, 9, 1, 2, 'Chuyên viên Chính sách & Phát triển nguồn lực', 'Số 02 Tôn Thất Tùng, P. Trung Tự, Q. Đống Đa, Hà Nội', 5, 20, 23, 3, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Chịu trách nhiệm sửa đổi, bổ sung, cập nhật các tài liệu tổ chức như: Sơ đồ tổ chức, Racis, chức năng nhiệm vụ, mô tả công việc, phân quyền, ủy quyền.\n                Tham gia xây dựng, rà soát sửa đổi, cập nhật các chính sách, văn bản quy định về tổ chức và nhân sự đảm bảo phù hợp với định hướng phát triển của Công ty.\n                Tham gia truyền thông, hướng dẫn, đào tạo, giải đáp thắc mắc cho các đơn vị trong quá trình triển khai, đưa vào áp dụng các chính sách về tổ chức và nhân sự.\n                Phối hợp với các phòng ban xây dựng, cập nhật các chỉ tiêu hiệu quả công việc cho các phòng ban và từng chức danh.\n                Kiểm soát và tổng hợp kết quả đánh giá hiệu quả công việc và tuân thủ phòng nhân sự.\n                Thực hiện báo cáo nhân sự theo yêu cầu.\n                Thực hiện các công việc khác theo yêu cầu.\n                YÊU CẦU CÔNG VIỆC\n                Tốt nghiệp đại học loại Khá trở lên hệ chính quy Đại học Kinh tế quốc dân, Đại học Ngoại thương, Học viện Tài chính, Đại học Luật ngành Quản trị nhân sự/ Kinh tế lao động, Luật kinh tế hoặc các chuyên ngành liên quan.\n                Ưu tiên có các chứng chỉ đào tạo về tuyển dụng, đánh giá nhân sự, quản trị nhân sự.\n                Có tối thiểu 03 năm kinh nghiệm ở vị trí chuyên viên chính hoặc tương đương trong lĩnh vực chuyên môn.\n                Có kinh nghiệm làm việc tại mảng Phát triển tổ chức tại các Công ty/Tập đoàn có quy mô từ 600 nhân sự trở lên.\n                Kỹ năng giao tiếp, làm việc độc lập và làm việc nhóm tốt.\n                Tư duy logic, kỹ năng phân tích và tổng hợp tốt.\n                Chủ động, sáng tạo, chịu được áp lực cao trong công việc.\n                Có khả năng đọc hiểu tốt các tài liệu bằng Tiếng Anh; Thành thạo tin học văn phòng, sử dụng phần mềm Quản trị nhân sự thành thạo.', '2023-08-22', 1, 1, '2023-07-22 02:05:00', NULL),
(8, 9, 1, 2, 'Công Nhân Lắp Đặt Cửa tại HCM và các tỉnh', ' 948 Hương Lộ 2, Bình Trị Đông A, Bình Tân, Hồ Chí Minh', 5, 9, 15, 0, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Công việc chính:\n\n                - Nhận cửa tại công trình; Tiến hành lắp đặt các sản phẩm cửa cho khách hàng tại nhà riêng và các dự án\n\n                Quyền lợi:\n\n                - Thu nhập bình quân 9-15 triệu/tháng tùy vào khối lượng và thời gian làm việc\n\n                - Nhiều khoản phụ cấp\n\n                - Cơ hội thăng tiến rộng mở (lên các vị trí Đội phó/đội trưởng)\n\n                - Khám sức khỏe hàng năm\n\n                - Hưởng đầy đủ quyền lợi, chế độ theo Luật lao động và chính sách của Công ty\n\n                YÊU CẦU CÔNG VIỆC\n                - Có xe máy cá nhân\n\n                - Có thể linh động di chuyển theo công trình\n\n                - Sức khỏe tốt\n\n                - Không yêu cầu kinh nghiệm, trình độ', '2023-08-21', 0, 1, '2023-07-20 02:05:00', NULL),
(9, 10, 1, 2, 'Sale Admin', 'Lô CX01, Khu đô thị Văn Khê, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam', 5, 8, 10, 0, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Theo dõi tiến độ xử lý đơn hàng trên phần mềm.\n                Xác nhận các thanh toán chuyển khoản của khách hàng.\n                Điều phối đơn hàng cho các kho/chi nhánh trực thuộc.\n                Hỗ trợ khách hàng xử lý các vấn đề trong quá trình mua hàng.\n                Thực hiện các công việc khác, báo cáo công việc theo yêu cầu cho cấp quản lý trực tiếp.\n                YÊU CẦU CÔNG VIỆC\n                Tốt nghiệp Cao đẳng trở lên chuyên ngành Kế toán, dược,......\n                Không yêu cầu kinh nghiệm.\n                Uư tiên ứng viên đã có kinh nghiệm vị trí tương đương về ngành dược.\n                Biết sử dụng các phần mềm ứng dụng (word, excel, phần mềm quản lý bán hàng...).\n                Kỹ năng giao tiếp, chủ động trong công việc.\n                Chủ động, có trách nhiệm trong công việc.', '2023-08-23', 1, 1, '2023-07-22 02:05:00', NULL),
(10, 10, 1, 2, 'Chuyên viên UI/UX', 'Lô CX01, Khu đô thị Văn Khê, Phường La Khê, Quận Hà Đông, Thành phố Hà Nội, Việt Nam', 5, 15, 20, 2, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Thiết kế UI/UX cho App, Website, Systerm và các sản phẩm khác theo tiêu chí thân thiện với người dùng.\n                Phối hợp chặt chẽ với các bộ phận liên quan (Customer, Marketing, Development, QA,…) để lựa chọn phương án thiết kế UX xuyên suốt dự án sản phẩm/dịch vụ.\n                Nghiên cứu và cập nhật các xu hướng thiết kế UI/UX hiện nay.\n                YÊU CẦU CÔNG VIỆC\n                Có ít nhất 1 năm kinh nghiệm ở vị trí tương đương.\n                Có khiếu thẩm mỹ tốt, nhận diện và biết sắp xếp bố cục hợp lý.\n                Sử dụng thành thạo các phần mềm thiết kế ( Photoshop, Figma, Sketch,...).\n                Sử dụng thành thạo công cụ dựng Prototype sản phẩm ( Invisionapp, Marvel, Framer…).\n                Thành thạo trong việc thiết kế 3D.\n                Có kinh nghiệm thiết kế nhân vật, game.\n                Có kiến thức về HTML/CSS là một lợi thế.', '2023-08-25', 0, 1, '2023-07-18 02:05:00', NULL),
(11, 11, 1, 3, 'IT Team Leader', 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội', 1, 45, 50, 5, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                - Understand and optimize user requirements\n                - Participate in all stages of the system development life cycle\n                - Design and develop high availability, automation and performance systems to support company departments in fulfilling their business goals effectively\n                - Write and design good, testable code with high performance\n                - Research and upgrade the systems when necessary\n                - Participate in the management of processes and systems of related departments\n                - Developing new projects periodically according to business strategies\n                - Mentor team members and improve team productivity\n\n                YÊU CẦU CÔNG VIỆC\n                - Bachelor degree in IT/Computer Science.\n                - 5+ years of progressive web development experience in a software engineer role (including progressing from Junior to Intermediate to Senior engineer roles).\n                - Minimum of 2 year of experience as Team Leader in leading Java IT projects.\n                - Experience in the following technologies: JavaScript, JSON, CSS, JQuery, Eclipse, Ajax and HTML 5.\n                - Experience in software development, Java Technologies/framework: Spring/Spring boot/ Oracle/SQL database.\n                - Experience in working with major system in Sales / Logistic is a plus.\n                - Strong English skills in verbal and communication.\n                - Experience in Jenkins, AWS is a plus.', '2023-08-21', 1, 1, '2023-07-16 02:05:00', NULL),
(12, 11, 1, 2, 'E-commerce Marketing Staff', 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội', 3, 10, 16, 1, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                - Develop media strategies, propose and plan media budgets\n                - Execute, analyze, and optimize advertisement both on-site (ecommerce platforms: Shopee, Lazada, Tiki, etc.) and off-site (Facebook, Google, etc.)\n                - Monitor E-Commerce trends, interesting initiatives, and market best practices for improving site conversion and shopper engagement\n                - Collaborate with the internal team - as well as external partners (eg: e-commerce platforms, media agency, etc.) to deliver the best E-commerce campaigns and achieve business KPIs\n                - Contact with the related team to provide campaign performance insights and evaluation and suggest key learnings\n                - Perform other related duties as assigned or requested\n\n                YÊU CẦU CÔNG VIỆC\n                - Bachelor’s degree in Business Administration/Marketing/Economics\n                - At least 1 years experience in the advertising field, online media planning, or relevant field\n                - Preferential treatment for those with experience in E-commerce\n                - Effective in time management, planning and execution\n                - Creative and proactive mindset and a good team player\n                - Strong sense of urgency and ability to work in a fast-paced environment', '2023-08-22', 0, 1, '2023-07-20 02:05:00', NULL),
(13, 11, 1, 2, 'Java Developer (Spring, MVC, Javascript)', 'Peakview Tower, 36 Hoàng Cầu, Ô Chợ Dừa, Đồng Đa, Hà Nội', 5, 18, 30, 1, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                - Tiếp nhận/xử lý các yêu cầu từ các phòng và ban lãnh đạo công ty.\n\n                - Cải thiện/năng cấp performance/ui/ux hệ thống.\n\n                - Kết nối phát triển các tính năng mới với các đối tác.\n\n                - Xây dựng tài liệu hướng dẫn hệ thống cho người dùng.\n\n                YÊU CẦU CÔNG VIỆC\n                - Tốt nghiệp đại học chuyên nghành CNTT/Khoa học máy tính.\n\n                - Có tối thiểu 2 năm kinh nghiệm phát triển phần mềm.\n\n                - Nắm vững kiến thức Java Core.\n\n                - Có kinh nghiệm tối thiểu 1 năm phát triển bằng ngôn ngữ Java( framework: Spring / Spring boot).\n\n                - Có kinh nghiệm thiết kế/làm việc với các cơ sở dữ liệu Oracle/SQL Server.\n\n                - Có kinh nghiệm làm việc với hệ thống trong lĩnh vực Bán hàng, Logistic, E-Com sẽ là một điểm cộng.\n\n                - Có tinh thần trách nhiệm trong công việc và tính tự giác cao, có thể làm việc độc lập hoặc theo nhóm.\n\n                - Toeic &gt;= 500.', '2023-08-16', 0, 1, '2023-07-15 02:05:00', NULL),
(14, 12, 1, 2, 'Nhân Viên Kinh Doanh', ' Lô DM7-6 Điểm tiểu thủ Công nghiệp Làng Nghề Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông, Thành phố Hà Nội', 4, 8, 15, 0, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Duy trì hệ thống Đại lý Cty đang kinh doanh: Phụ trách 1 vùng khách hàng riêng: hoàn thành chỉ tiêu doanh số, thị phần khu vực mình phụ trách.\n                Chịu trách nhiệm mở hệ thống đại lý mới.\n                Làm kế hoạch bán hàng cho từng Khách hàng, từng tháng.\n                Đàm phán giá bán, chính sách bán hàng, chính sách hỗ trợ marketing với Khách hàng và với người Phụ trách sản phẩm (PM).\n                Đi khảo sát thị trường thường xuyên, gặp gỡ Khách hàng.\n                Triển khai các hoạt động marketing, trưng bày sản phẩm tại Khách hàng.\n                Thu thập thông tin thị trường, giá cả và chương trình của đối thủ.\n                Chịu trách nhiệm đào tạo nhân viên Kinh doanh của Khách hàng về sản phẩm mình đang kinh doanh.\n                Tiếp nhận thông tin, khiếu nại, đơn hàng của khách hàng và phải trực tiếp giải quyết, nếu chuyển cho bộ phận liên quan thì phải trực tiếp đôn đốc.\n                Đánh giá, đề xuất hạn mức nợ và chịu trách nhiệm theo quy định nếu xảy ra rủi ro mất nợ.\n                Kiểm soát việc niêm yết giá của từng KH.\n                Báo cáo:\n                +Lập báo cáo tình hình KD hàng tuần.\n\n                + Lập báo cáo cập nhật giá đối thủ.\n\n                YÊU CẦU CÔNG VIỆC\n                Ngoại hình khá, sức khỏe tốt.\n                Ít nhất 1 năm kinh nghiệm.\n                Khả năng tiếp thu và xử lý thông tin tốt, giọng nói dễ nghe.\n                Khả năng khai thác, tạo dựng các mối quan hệ.\n                Có tính kỷ luật cao, có ý thức làm việc tập thể tốt.\n                Khả năng làm việc nhóm, chịu được áp lực công việc.\n                Trung thực, nhanh nhẹn, chu đáo, ham học hỏi.', '2023-08-17', 0, 1, '2023-07-16 02:05:00', NULL),
(15, 12, 1, 2, 'Trưởng Phòng Kinh Doanh', ' Lô DM7-6 Điểm tiểu thủ Công nghiệp Làng Nghề Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông, Thành phố Hà Nội', 1, NULL, NULL, 0, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                - Điều hành Phòng Kinh doanh Khu vực Phía Bắc.\n                - Chịu trách nhiệm doanh thu và nợ.\n                - Phân tích, dự báo lập kế hoạch kinh doanh.\n                - Nghiên cứu và tổng hợp các chính sách Giá, chiết khấu.\n                - Triển khai các chương trình marketing.\n                - Đào tạo đội ngũ kinh doanh.\n                - Xây dựng chính sách thưởng, đãi ngộ cho KD.\n                - Quan hệ với các đối tác quan trọng.\n                - Phối hợp với bộ phận Sản phẩm trong việc nghiên cứu &amp; phát triển sản phẩm tiềm năng.\n\n                YÊU CẦU CÔNG VIỆC\n                - Tốt nghiệp Đại học chính quy: Thương mại, QTKD, Ngoại thương, Marketing.\n                - Sáng tạo, đam mê và khao khát thăng tiến trong công việc.\n                - Hiểu biết sâu về Kế hoạch, kênh phân phối, marketing, chính sách bán hàng, quan hệ Khách hàng.\n                - Thành thạo Vi tính văn phòng &amp; Internet.\n                - Có khả năng giao tiếp bằng tiếng Anh.\n                - Có kinh nghiệp trong ngành Máy tính là một ưu tiên.\n\n                *** Hồ sơ ứng tuyển (photo) bao gồm:\n\n                + SYLL,\n\n                + Thư xin việc\n\n                + Các bằng cấp liên quan\n\n                - Địa điểm làm việc tại: Lô DM7-6, Điểm Tiểu Thủ Công Nghiệp Làng Nghề Vạn Phúc, Hà Đông, TP.Hà Nội', '2023-08-18', 1, 1, '2023-07-17 02:05:00', NULL),
(16, 13, 1, 2, 'Nhân Viên Kinh Doanh Logistics', 'Tầng 4, tòa nhà FLC Landmark Tower, Ngõ 5 Lê Đức Thọ, Mỹ Đình 2, Nam Từ Liêm\n                32 Thủy Lợi, Phước Long A, Quận 9, Thành phố Hồ Chí Minh', 3, 10, 15, 2, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                - Thực hiện tìm kiếm khách hàng, bán hàng dịch vụ Logistics.\n                - Xây dựng giá cước, cơ chế kinh doanh, phương án cung cấp dịch vụ cho khách hàng.\n                - Tìm kiếm, liên hệ các đối tác vận chuyển để có giá cước hợp lý cung cấp cho khách hàng.\n                - Thực hiện các công việc khác do lãnh đạo trung tâm giao.\n\n                YÊU CẦU CÔNG VIỆC\n                - Tốt nghiệp Đại học chuyên ngành kinh tế, thương mại.\n                - Hiểu biết về dịch vụ Logistics và nghiệp vụ xuất - nhập khẩu.\n                - Ưu tiên ứng viên đã có kinh nghiệm làm kinh doanh dịch vụ Logistics, xuất nhập khẩu.\n                - Chỉ tuyển nam.', '2023-08-19', 0, 1, '2023-07-18 02:05:00', NULL),
(17, 13, 1, 4, 'Trưởng Bưu Cục Khách Hàng Lớn', 'Khu đô thị Hành Lạc, huyện Văn Lâm, Hưng Yên\n                KDC Hưng Phú 1, Hưng Phú, Cái Răng, Cần Thơ', 1, 12, 15, 2, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Địa điểm làm việc: Huyện Văn Lâm, Tỉnh Hưng Yên, TP. Cần Thơ\n\n                Mô tả công việc: Quản lý, điều hành chung các hoạt động sản xuất, kinh doanh của Bưu cục KHL trong hoạt động kinh doanh dịch vụ Chuyển phát nhanh EMS và Logistics, cụ thể:\n\n                - Điều hành công tác kinh doanh:\n                + Xây dựng kế hoạch hoạt động của Bưu cục thực hiện các chỉ tiêu kinh doanh hàng tháng, năm và theo giai đoạn.\n                + Tìm kiếm, phát triển khách hàng, chăm sóc khách hàng; phát triển doanh thu của Bưu cục.\n\n                - Quản lý nhân sự - tài chính:\n                + Chịu trách nhiệm về nhân sự: Nhân viên kinh doanh, Giao dịch viên, nhân viên thu gom\n                + Kiểm soát rủi ro liên quan đến công nợ khách hàng của Bưu cục.\n\n                - Quản lý vận hành:\n                + Thực hiện và quản lý việc vận hành chấp nhận và chuyển phát hàng hóa tại Bưu cục.\n                + Giám sát các công đoạn thu gom và chấp nhận, đóng chuyển và giao nhận trong quy trình cung cấp dịch vụ tại Bưu cục nhằm dảm bảo chất lượng dịch vụ.\n\n                YÊU CẦU CÔNG VIỆC\n                YÊU CẦU:\n                - Trình độ: Tốt nghiệp Đại học/Cao đẳng các chuyên ngành Tài chính - Kế toán, Kinh tế, Quản trị kinh doanh (Hệ chính quy)\n                - Tuổi: 25 - 35 tuổi (ưu tiên nam)\n                - Có kỹ năng và kinh nghiệm quản lý; ưu tiên ứng viên đã có kinh nghiệm làm Trưởng Bưu cục tại các Công ty vận chuyển.\n\n                CHẾ ĐỘ:\n                - Thu nhập hấp dẫn (Trao đổi cụ thể khi phỏng vấn)\n                - Thưởng các ngày nghỉ lễ, Tết, hưởng các khoản phúc lợi khác trong năm theo quy định...\n                - Xem xét tăng lương hàng năm theo năng lực,\n                - Được hưởng đầy đủ BHXH, BHYT và BHTN theo Luật lao động hiện hành. Gói chăm sóc sức khỏe riêng theo chế độ của công ty.\n                - Nghỉ phép năm theo quy định.\n                - Môi trường làm việc chuyên nghiệp, năng động, sáng tạo, được đào tạo với các chuyên gia huấn luyện, cơ hội thăng tiến cao.\n                - Tham gia các hoạt động chung của Công ty: Du lịch, ca nhạc, thể thao, Team Building...', '2023-08-20', 1, 1, '2023-07-20 02:05:00', NULL),
(18, 14, 1, 2, 'Junior C# Developer (.Net)', 'Tầng 17, Tòa nhà IDMC Mỹ Đình, số 15 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội', 6, 18, 27, 2, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                • Phát triển mới các modules, chức năng, bảo trì phần mềm kế toán.\n\n                • Phân tích, thảo luận giải pháp với Trưởng nhóm , Trưởng nhóm phụ trách kỹ thuật, Trưởng dự án và triển khai các giải pháp.\n\n                • Viết tài liệu liên quan đến công việc được giao\n\n                • Hỗ trợ team CS xử lý lỗi cho khách hàng\n\n                YÊU CẦU CÔNG VIỆC\n                • Có một năm kinh nghiệm làm việc với các dự án về .NET, .NET core  C# và ASP.NET MVC từ  1 năm trở lên\n\n                • Có kinh nghiệm làm việc với Infragistics windows forms.\n\n                • Có kinh nghiệm làm việc với MSSQL Server (từ phiên bản 2016), biết sử dụng các công cụ để tối ưu stored procedure, các câu lệnh T-SQL\n\n                • Hiểu về mô hình phát triển Agile- Scrum\n\n                • Hiểu về lập trình hướng đối tượng, nguyên lý SOLID\n\n                Chế độ:\n\n                Giờ làm việc hành chính từ thứ 2- thứ 6. Nghỉ thứ 7, chủ nhật hàng tuần\n                Lương cứng: upto 27 triệu/tháng\n                Được làm việc trong môi trường chuyên nghiệp, trẻ trung, năng động.\n                Đóng  BHXH, BHYT, BHTN theo quy định của nhà nước\n                Thưởng các ngày lễ, tết, sinh nhật (1/1, 30/4,1/5,1/6, 2/9, Trung thu,…….)\n                Khám sức khỏe, du lịch, teambuilding, ……theo quy định công ty\n                Chế độ hiếu/hỉ; ốm đau theo quy định công ty\n                Cơ hội làm việc với các chuyên gia Hàn Quốc\n                Cơ hội học tiếng Hàn miễn phí', '2023-08-15', 0, 1, '2023-07-14 02:05:00', NULL),
(19, 14, 1, 2, 'Kiểm Thử Phần Mềm (Software Tester )', 'Tầng 17, Tòa nhà IDMC Mỹ Đình, số 15 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội', 2, 10, 16, 3, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Thiết kế testcase cho phần mềm dựa trên tài liệu yêu cầu, tài liệu đặc tả và thiết kế (Phần mềm ERP)\n                Thực hiện test dựa trên testplan và testcase\n                Tìm lỗi sản phẩm, phân tích nguyên nhân gây ra lỗi và quản lý hoạt động fix lỗi.\n                Làm báo cáo test và đánh giá chất lượng sản phẩm trước khi bàn giao cho khách hàng.\n                Đề xuất các hoạt động cải tiến chất lượng sản phẩm\n\n                YÊU CẦU CÔNG VIỆC\n                Từ 2 năm kinh nghiệm trở lên ở vị trí tương đương\n                Có kinh nghiệm về các hệ thống erp, phần mềm kế toán hoặc có kiến thức chuyên ngành tài chính kế toán\n                Có kiến thức về phát triển dự án theo phương pháp Agile\n                Hiểu biết về Test Performance và Load Test.\n                Có tính cẩn thận, tỉ mỉ, kiên nhẫn, có trách nhiệm và chịu được áp lực công việc trong công việc\n                Có khả năng làm việc độc lập và theo nhóm, nhóm dự án từ nhiều quốc gia\n                Có kỹ năng giao tiếp, kỹ năng giải quyết vấn đề tốt (có thể tiếng Anh là một lợi thế)\n\n                Quyền lợi:\n\n                Lương: upto 16 triệu. Làm việc T2-T6\n                Cơ hội tiếp cận và học hỏi công nghệ tiên tiến về Big Data - Automation - OCR\n                Cơ hội phát triển lên TestLead\n                Được làm việc trong môi trường chuyên nghiệp, trẻ trung, năng động.\n                Đóng  BHXH, BHYT, BHTN theo quy định của nhà nước\n                Thưởng các ngày lễ, tết, sinh nhật (1/1, 30/4,1/5,1/6, 2/9, Trung thu,…….)\n                Khám sức khỏe, du lịch, teambuilding, ……theo quy định công ty\n                Chế độ hiếu/hỉ; ốm đau theo quy định công ty\n                Cơ hội làm việc với các chuyên gia Hàn Quốc\n                Cơ hội học tiếng Hàn miễn phí', '2023-08-16', 1, 1, '2023-07-15 02:05:00', NULL),
(20, 14, 1, 2, 'Technical Sales / Sales IT', '163 Nguyễn Văn Trỗi, phường 11, Phú Nhuận, Thành phố Hồ Chí Minh', 5, 18, 30, 3, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                InfoPlus cung cấp các giải pháp thiết bị công nghệ thông tin của các hãng như: Secui, Piolink, Genians, Duruan, Netand, Jirasoft,..\n\n                Cụ thể là các giải pháp network, security: firewall, IPS, Anti-DDos, ADS, WAF, Cloud Security Switch, NAC, e-DRM, ….\n\n                - Tìm kiếm, thực hiện Maketing, khai thác và phát triển các cơ hội kinh doanh với các khách hàng tiềm năng là các reseller\n                - Thực hiện bán sản phẩm, quản lí và hỗ trợ cho Reseller\n\n                - Quản lí tiến độ và các mốc quan trọng của dự án. Làm việc với các bên liên quan như nhà cung cấp, khách hàng, bộ phận bán hàng… để triển khai dự án\n                - Phân tích &amp; dự báo tình hình khách hàng, thị trường, đề xuất các đối sách cần thiết kịp thời.\n\n                -Chi tiết công việc sẽ trao đổi kỹ hơn khi phỏng vấn.\n\n                YÊU CẦU CÔNG VIỆC\n                - Tối thiểu 02 năm kinh nghiệm kinh doanh các sản phẩm/giải pháp network, security\n\n                - Có khả năng trình bày, diễn giải xúc tích, dễ hiểu.\n\n                - Có khả năng đọc hiểu các tài liệu kỹ thuật tiếng Anh.\n\n                - Có thể giao tiếp Tiếng Anh là một lợi thế.\n\n                - Nộp CV bằng tiếng Anh\n\n                Quyền lợi\n\n                Lương up to 30 triệu. Làm việc từ T2-T6, nghỉ T7, CN\n\n                Được làm việc trong môi trường chuyên nghiệp, trẻ trung, năng động.\n\n                Đóng BHXH, BHYT, BHTN theo quy định của nhà nước\n\n                Thưởng các ngày lễ, tết, sinh nhật (1/1, 30/4,1/5,1/6, 2/9, Trung thu,…….)\n\n                Khám sức khỏe, teambuilding, ……theo quy định công ty\n\n                Chế độ hiếu/hỉ; ốm đau theo quy định công ty\n\n                Cơ hội làm việc với các chuyên gia Hàn Quốc\n\n                Cơ hội học tiếng Hàn miễn phí', '2023-08-17', 0, 1, '2023-07-16 02:05:00', NULL),
(21, 15, 1, 2, 'Chuyên viên Tài trợ thương mại (SME) - Khu vực Hưng Yên', 'Đình Đông Khúc, Vĩnh Khúc, Văn Giang, Hưng Yên', 2, 15, 30, 1, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Triển khai upsales cùng Chuyên viên Quan hệ Khách hàng (RM SME) đối với danh mục Khách hàng hiện hữu đồng thời phát triển bán mới các KH có nhu cầu sử dụng dịch vụ TTTM thông qua:\n                - Xây dựng các giải pháp bán hàng tư vấn về sản phẩm TTTM và ngoại hối cho khách hàng;\n                - Xử lý giao dịch phát hành/sửa đổi LC nhập khẩu;\n                Thiết lập mối quan hệ hiệu quả và chuyên nghiệp với nhân sự chủ chốt của khách hàng TTTM thuộc danh mục được phân giao.\n                Xử lý vướng mắc trong quá trình cung cấp sản phẩm, dịch vụ TTTM tới khách hàng kịp thời thông qua phối hợp với các bộ phận, phòng ban liên quan.\n                Cập nhật nâng cao kiến thức về nghiệp vụ thương mại quốc tế, sản phẩm TTTM, chính sách và quy trình của ngân hàng.\n                Thu thập, phản hồi thông tin (các điểm chưa cạnh tranh, lỗ hổng của sản phẩm…) cũng như đề xuất các sáng kiến cải tiến.\n                Hướng dẫn cho RM SME tại Chi nhánh về hồ sơ, kỹ năng tư vấn TTTM.\n                YÊU CẦU CÔNG VIỆC\n                Cử nhân chuyên ngành Thanh toán quốc tế, Ngân hàng, Kinh tế đối ngoại, Tài chính ngân hàng …\n                TOEIC 450 trở lên hoặc chứng chỉ tương đương\n                Hiểu biết về hoạt động kinh doanh Tài Chính, tiền tệ, ngân hàng, thanh toán quốc tế, tài trợ thương mại, xuất nhập khẩu.v..v...', '2023-08-18', 1, 1, '2023-07-17 02:05:00', NULL),
(22, 15, 1, 2, 'Chuyên viên UB (Chuyên viên Tư vấn) - MB Bình Tân', '6D Trường Sa, phường 17, Bình Thạnh, Hồ Chí Minh', 2, 8, 15, 8, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Thực hiện công tác bán hàng tại sàn giao dịch chi nhánh: tư vấn và bán các sản phẩm, dịch vụ của MB cho Khách hàng cá nhân bao gồm: Huy động vốn, tài khoản thanh toán, thẻ, ngân hàng điện tử… Bán chéo sản phẩm dịch vụ của MB…\n                Thực hiện cung cấp dịch vụ tại sàn giao dịch chi nhánh\n                Tiếp nhận và giải quyết khiếu nại, thắc mắc của khách hàng, hỗ trợ khách hàng; chào đón, phân luồng và tư vấn khách hàng\n                Thực hiện các công việc khác theo phân công của Cán bộ quản lý trực tiếp phù hợp với năng lực và phạm vi công việc.\n                YÊU CẦU CÔNG VIỆC\n                Tốt nghiệp Đại học trở lên các chuyên ngành kinh tế\n                Hiểu biết các kiến thức về sản phẩm, dịch vụ của Ngân hàng dành cho Khách hàng cá nhân\n                Ưu tiên ứng viên có kinh nghiệm  ở vị trí quan hệ khách hàng/Giao dịch viên/Chăm sóc khách hàng/Nhân viên kinh doanh...\n                Kỹ năng bán hàng, kỹ năng giao tiếp tốt\n                Ngoại hình khá (Nam cao 1m68 trở lên, nữ cao 1m58 trở lên)\n                Thành thạo tin học văn phòng cơ bản (word, excel, outlook…)\n                Ưu tiên ứng viên có ngoại ngữ tốt\n                Địa điểm làm việc: MB Bình Tân - Số 435 - 441 Đường số 7, P Bình Trị Đông B, Q Bình Tân, Tp HCM', '2023-08-19', 0, 1, '2023-07-18 02:05:00', NULL),
(23, 16, 1, 2, 'Marketing Executive', 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam', 3, NULL, NULL, 8, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Execute and report on the results of Inbound Marketing activities: SEO, SEM, Social Media, Email Marketing, Landing pages, etc.\n                Plan and organize physical events and virtual events professionally.\n                Brand management, planning and implementing PR activities, building Customer Success, etc\n                Propose new ideas, and regularly update new trends that can be applied in practice.\n                Participate in internal communication activities: Content, Team building, etc.\n                Other tasks assigned by the line manager.\n                YÊU CẦU CÔNG VIỆC\n                Graduated from University majoring in Marketing, Communication, Business Administration or related fields\n                 02+ years of experience in a similar position\n                Ability to write and edit content, redact documents, PR\n                Ability to design basic media publication\n                Language proficiency level of TOEIC &gt; 700\n                Positive, dynamic, creative, progressive and inquisitive attitude\n                Initiative and high responsibility\n                Result-oriented &amp; can-do attitude\n                Demonstrate open mindedness, ability to listen, high sense of curiosity to understand trends and needs\n                Good communication, presentation skills, ability to be MC is an advantage\n                Critical thinking and good problem-solving skills, ability to multitask\n                Adaptable and adept in working in a high-growth environment.\n                COMPANY BENEFITS\n\n                Opportunity to work in global projects of fast-developing companies and be a part of innovation, big SAP projects.\n                13th-month salary.\n                Participating fully in benefits according to regulations and policies of the company.\n                Other company benefits include participating in comprehensive Citek care insurance, annual domestic or international travel, and annual medical examination…\n                Participate in the training program to improve knowledge about SAP ERP, B2B, techniques.\n                Young, dynamic, and friendly working environment.\n                Location\n\n                Ha do Building, floor 9 - 10, 2 Hong Ha Street, Ward 2, Tan Binh District, HCM City.\n                Salary &amp; Benefits\n\n                According to the company&#039;s regulations\n                Working Time\n\n                From Monday to Friday: 8h30 - 17h30 (Lunch Break 12h00 - 13h00 )', '2023-08-19', 1, 1, '2023-07-18 02:05:00', NULL);
INSERT INTO `jobs` (`id`, `employer_id`, `jtype_id`, `jlevel_id`, `jname`, `address`, `amount`, `min_salary`, `max_salary`, `yoe`, `gender`, `description`, `expire_at`, `is_hot`, `is_active`, `created_at`, `updated_at`) VALUES
(24, 16, 1, 2, 'Presale ERP Oracle NetSuite', 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam', 1, NULL, NULL, 5, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                The opening is for Presales of Oracle NetSuite:\n\n                Research and understand the features and functionalities of Oracle NetSuite products in order to introduce and consult customers.\n                Plan and prepare reports and documents presenting solutions, implementation costs, service quality, and other evaluation criteria.\n                Work and interact with customers to collect information about their needs and requirements, provide appropriate solutions, and advise on the company&#039;s products and services.\n                Advise and answer customers&#039; questions about the company&#039;s products and services.\n                Participate in the negotiation process and persuade customers about the Oracle NetSuite ERP solution and provide technical support to the sales team.\n                Support the implementation team during the ERP project implementation, including providing solutions, proposing improvements, and monitoring the implementation process.\n                Ensure that the solutions implemented meet customer requirements and quality standards.\n                Participate in the analysis of requirements, surveying customer needs, and proposing appropriate solutions for Oracle NetSuite ERP.\n                YÊU CẦU CÔNG VIỆC\n                Citek is looking for talents:\n\n                Senior Business Consultant : At least 5 years of relevant work experience in ERP Consultant (Oracle NetSuite, SAP, B1, Microsoft Dynamic) or a similar field preferred.\n                Bachelor and experience:\n\n                Graduated from university majoring in Finance, Accounting,  Business Administration, Logistic, Information Systems, Business Administration, Economics, International Business.\n                Involved in at least 3 full cycle projects ERP.\n                Working knowledge of integration with other ERP.\n                Strong in the management of ERP Finance, ERP SCM, Integration (ERP &amp; Other system / platform).\n                Able to travel according to job requirements.\n                Have a development orientation and long-term attachment to the ERP industry.\n                Have a development orientation and long-term attachment to the Oracle NetSuite.\n                Skills:\n\n                English: Toeic 650 or Toiec 700\n                Microsoft\n                Communication Skill\n                Time Management\n                Able\n                to work under high pressure\n                COMPANY BENEFITS\n\n                Salary and commission: Negotiable according to capacity and working ability.\n                Opportunity to work in global projects of the fast developing company and being a part of innovation, big Oracle NetSuite projects.\n                Participating fully in benefits according to regulations and policies of the company.\n                Other company benefits such as: participating in comprehensive Citek care insurance, annual domestic or international travel, annual medical examination...\n                Participate in the training program to improve knowledge about Oracle NetSuite, B2B, technique.\n                Young, dynamic, and friendly working environment.\n                Other Information:\n\n                Working time: Mon - Fri (8:30 am - 5:30 pm)\n                Probation: 2 months (full 100% offer)\n                Location\n\n                Ha do Building, floor 9+10, 2 Hong Ha Street, Ward 2, Tan Binh District, HCM City.\n                Salary &amp; Benefits\n\n                According to the company&#039;s regulations\n                Working Time\n\n                From Monday to Friday: 8h30 - 17h30 (Lunch Break 12h00 - 13h00 )', '2023-08-20', 0, 1, '2023-07-19 02:05:00', NULL),
(25, 10, 3, 1, 'Thực tập sinh Marketing', 'Số 2 Hồng Hà, Phường 2, Quận Tân Bình, Thành phố Hồ Chí Minh, Việt Nam', 4, NULL, NULL, 0, NULL, '\n                MÔ TẢ CÔNG VIỆC\n                Lên ý tưởng, sản xuất và tối ưu nội dung (text, image, video) trên Website và các kênh Social như Facebook, Linkedin, YouTube, TikTok,…\n                Tham gia tổ chức các sự kiện online và offline\n                Đóng góp ý tưởng sáng tạo cho từng chiến dịch Marketing\n                Cập nhật các tin tức về thị trường, xu hướng mới\n                YÊU CẦU CÔNG VIỆC\n                Sinh viên năm cuối/mới tốt nghiệp chuyên ngành Marketing, PR, Ngoại ngữ, Kinh tế, QTKD, Thương mại điện tử,…\n                Thích viết lách, có kiến thức nền tảng về Marketing: SEO, Website, content,…\n                Khả năng giao tiếp và đọc hiểu Anh văn tốt (tối thiểu 550 Toeic)\n                Có khả năng thiết kế và chỉnh sửa video cơ bản, ưu tiên có khả năng thiết kế trên Canva, Ps, Ai\n                Có kinh nghiệm phát triển nội dung trên kênh social và xây dựng cộng đồng là một lợi thế.\n                Năng động, sáng tạo, chủ động học hỏi và cầu tiến.\n                Tinh thần trách nhiệm cao, cẩn thận trong công việc.\n                Yêu thích và có định hướng phát triển lâu dài trong lĩnh vực Marketing\n                Khả năng làm việc nhóm tốt, có khả năng phân tích và phản biện tốt', '2023-08-21', 1, 1, '2023-07-20 02:05:00', NULL),
(28, 8, 2, 3, 'vvvvvvvvvvvvvvv', 'tryytr', 3, NULL, NULL, 3, NULL, 'qqq', '2024-04-06', 0, 1, '2024-03-21 09:05:12', '2024-03-21 09:05:12'),
(29, 8, 2, 4, 'demo them viec', 'abcd....', 3, NULL, NULL, 3, NULL, 'abcd', '2024-03-30', 0, 1, '2024-03-21 11:26:04', '2024-03-21 11:26:04');

-- --------------------------------------------------------

--
-- Table structure for table `job_applying`
--

CREATE TABLE `job_applying` (
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `cv_link` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_applying`
--

INSERT INTO `job_applying` (`job_id`, `candidate_id`, `cv_link`, `status`, `created_at`, `updated_at`) VALUES
(1, 18, 'http://localhost:8000/storage/cv_images/cand18_Screenshot 2024-03-20 101748.png', 0, '2024-03-20 15:41:00', NULL),
(1, 19, 'http://localhost:8000/storage/cv_images/cand19_jpg.png', 0, '2024-03-21 09:16:57', NULL),
(1, 20, 'http://localhost:8000/storage/cv_images/cand20_hoso1.jpg', 0, '2024-03-21 11:22:54', NULL),
(2, 18, 'http://localhost:8000/storage/cv_images/cand18_Screenshot 2024-03-20 101748.png', 0, '2024-03-20 15:57:05', NULL),
(25, 20, 'http://localhost:8000/storage/cv_images/cand20_hoso1.jpg', 0, '2024-03-21 11:23:45', NULL),
(28, 19, 'http://localhost:8000/storage/cv_images/cand19_cand18_Screenshot 2024-03-20 101748.png', 0, '2024-03-21 09:14:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `job_industry`
--

CREATE TABLE `job_industry` (
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `industry_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_industry`
--

INSERT INTO `job_industry` (`job_id`, `industry_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 1),
(2, 4),
(2, 5),
(3, 1),
(3, 2),
(3, 3),
(4, 6),
(4, 7),
(5, 2),
(5, 3),
(5, 8),
(6, 2),
(6, 3),
(7, 9),
(8, 1),
(8, 6),
(8, 10),
(9, 11),
(9, 12),
(9, 13),
(10, 2),
(11, 2),
(11, 11),
(12, 14),
(13, 2),
(14, 3),
(14, 11),
(15, 3),
(15, 11),
(16, 11),
(16, 14),
(17, 11),
(17, 15),
(18, 2),
(18, 3),
(19, 2),
(20, 2),
(20, 3),
(20, 11),
(21, 1),
(21, 5),
(22, 1),
(22, 5),
(23, 2),
(23, 11),
(23, 14),
(24, 2),
(24, 11),
(24, 16),
(25, 14),
(26, 2),
(27, 4),
(28, 2),
(29, 2);

-- --------------------------------------------------------

--
-- Table structure for table `job_location`
--

CREATE TABLE `job_location` (
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `job_location`
--

INSERT INTO `job_location` (`job_id`, `location_id`) VALUES
(1, 24),
(2, 29),
(3, 29),
(4, 24),
(5, 24),
(6, 24),
(7, 24),
(8, 29),
(9, 24),
(10, 24),
(11, 24),
(12, 24),
(13, 24),
(14, 24),
(15, 24),
(16, 24),
(16, 29),
(17, 14),
(17, 31),
(18, 24),
(19, 24),
(20, 29),
(21, 31),
(22, 29),
(23, 29),
(24, 29),
(25, 29),
(26, 3),
(27, 2),
(28, 2),
(29, 4);

-- --------------------------------------------------------

--
-- Table structure for table `job_skill`
--

CREATE TABLE `job_skill` (
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `skill_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_tag`
--

CREATE TABLE `job_tag` (
  `job_id` bigint(20) UNSIGNED NOT NULL,
  `tag_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jskills`
--

CREATE TABLE `jskills` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jtags`
--

CREATE TABLE `jtags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jtypes`
--

CREATE TABLE `jtypes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jtypes`
--

INSERT INTO `jtypes` (`id`, `name`) VALUES
(1, 'Nhân viên chính thức'),
(2, 'Tạm thời / Dự án'),
(3, 'Thực tập');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`id`, `name`) VALUES
(1, 'An Giang'),
(2, 'Bà Rịa-Vũng Tàu'),
(3, 'Bạc Liêu'),
(4, 'Bắc Kạn'),
(5, 'Bắc Giang'),
(6, 'Bắc Ninh'),
(7, 'Bến Tre'),
(8, 'Bình Dương'),
(9, 'Bình Định'),
(10, 'Bình Phước'),
(11, 'Bình Thuận'),
(12, 'Cà Mau'),
(13, 'Cao Bằng'),
(14, 'Cần Thơ'),
(15, 'Đà Nẵng'),
(16, 'Đắk Lắk'),
(17, 'Đắk Nông'),
(18, 'Điện Biên'),
(19, 'Đồng Nai'),
(20, 'Đồng Tháp'),
(21, 'Gia Lai'),
(22, 'Hà Giang'),
(23, 'Hà Nam'),
(24, 'Hà Nội'),
(25, 'Hà Tĩnh'),
(26, 'Hải Dương'),
(27, 'Hải Phòng'),
(28, 'Hòa Bình'),
(29, 'Hồ Chí Minh'),
(30, 'Hậu Giang'),
(31, 'Hưng Yên'),
(32, 'Khánh Hòa'),
(33, 'Kiên Giang'),
(34, 'Kon Tum'),
(35, 'Lai Châu'),
(36, 'Lào Cai'),
(37, 'Lạng Sơn'),
(38, 'Lâm Đồng'),
(39, 'Long An'),
(40, 'Nam Định'),
(41, 'Nghệ An'),
(42, 'Ninh Bình'),
(43, 'Ninh Thuận'),
(44, 'Phú Thọ'),
(45, 'Phú Yên'),
(46, 'Quảng Bình'),
(47, 'Quảng Nam'),
(48, 'Quảng Ngãi'),
(49, 'Quảng Ninh'),
(50, 'Quảng Trị'),
(51, 'Sóc Trăng'),
(52, 'Sơn La'),
(53, 'Tây Ninh'),
(54, 'Thái Bình'),
(55, 'Thái Nguyên'),
(56, 'Thanh Hóa'),
(57, 'Thừa Thiên-Huế'),
(58, 'Tiền Giang'),
(59, 'Trà Vinh'),
(60, 'Tuyên Quang'),
(61, 'Vĩnh Long'),
(62, 'Vĩnh Phúc'),
(63, 'Yên Bái');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2014_10_12_000000_create_users_table', 1),
(2, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(3, '2019_08_19_000000_create_failed_jobs_table', 1),
(4, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(5, '2023_05_15_105930_create-candidates-table', 1),
(6, '2023_05_18_015317_create-employers-table', 1),
(7, '2023_05_18_015349_create-jobs-table', 1),
(8, '2023_05_18_015455_create-industries-table', 1),
(9, '2023_05_18_015519_create-locations-table', 1),
(10, '2023_05_18_015540_create-jtypes-table', 1),
(11, '2023_05_18_015605_create-jlevels-table', 1),
(12, '2023_05_18_015642_create-jtags-table', 1),
(13, '2023_05_18_015700_create-jskills-table', 1),
(14, '2023_05_18_015757_create-job-applying-table', 1),
(15, '2023_05_18_020112_create-educations-table', 1),
(16, '2023_05_18_020158_create-experiences-table', 1),
(17, '2023_05_18_020221_create-projects-table', 1),
(18, '2023_05_18_020306_create-skills-table', 1),
(19, '2023_05_18_020332_create-certificates-table', 1),
(20, '2023_05_18_020356_create-prizes-table', 1),
(21, '2023_05_18_020429_create-activities-table', 1),
(22, '2023_05_18_031155_create-job-tag-table', 1),
(23, '2023_05_18_031210_create-job-skill-table', 1),
(24, '2023_06_01_020423_create-employer-location-table', 1),
(25, '2023_06_01_031704_create-job-industry-table', 1),
(26, '2023_06_02_013037_create-job-location-table', 1),
(27, '2023_07_14_082259_create_candidate_messages_table', 1),
(28, '2023_07_18_155830_create-saved-jobs-table', 1),
(29, '2024_01_05_154802_create_others_table', 2),
(30, '2024_01_05_155307_create_resumes_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `others`
--

CREATE TABLE `others` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `resume_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prizes`
--

CREATE TABLE `prizes` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `received_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prj_type` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `technologies` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`candidate_id`, `name`, `prj_type`, `role`, `technologies`, `start_date`, `end_date`, `description`, `link`) VALUES
(20, 'project', 'nhóm', 'admin', 'php', '2024-03-15', '2024-03-22', 'abcd.......', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s');

-- --------------------------------------------------------

--
-- Table structure for table `resumes`
--

CREATE TABLE `resumes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fullname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` tinyint(3) UNSIGNED DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `phone` char(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objective` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `personalTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objectiveTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `educationTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experienceTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `projectTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skillTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificateTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prizeTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activityTitle` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cv_link` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parts_order` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parts_order`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resumes`
--

INSERT INTO `resumes` (`id`, `candidate_id`, `title`, `fullname`, `gender`, `dob`, `phone`, `email`, `address`, `link`, `avatar`, `objective`, `personalTitle`, `objectiveTitle`, `educationTitle`, `experienceTitle`, `projectTitle`, `skillTitle`, `certificateTitle`, `prizeTitle`, `activityTitle`, `cv_link`, `parts_order`, `created_at`, `updated_at`) VALUES
(1, 18, 'hhhh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'đâs', 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-20 15:23:23', '2024-03-20 15:23:23'),
(2, 18, 'hhhh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'đâs', 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-20 15:23:31', '2024-03-20 15:23:31'),
(3, 18, 'hhhh', 'gdfgdf', NULL, '2000-01-01', '0987654321', 'gg@gmail.com', 'â', 'â', NULL, 'đâs', 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-20 15:24:40', '2024-03-20 15:24:40'),
(4, 18, 'hhhh', 'gdfgdf', NULL, '2000-01-01', '0987654321', 'gg@gmail.com', 'â', 'â', NULL, 'đâs', 'Thông tin cá nhân', 'Mục tiêu nghề ncfghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-20 15:25:04', '2024-03-20 15:25:04'),
(5, 18, 'uuuu', 'kkk nnnnnn', NULL, '2024-03-13', '0364877525', 'dothanhnhan20k@gmail.com', 'uuuu ggg', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s', 'http://localhost:8000/storage/avatar_images/avatar_candidate__18', 'fsdfsdf', 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-20 15:49:42', '2024-03-20 15:49:42'),
(6, 19, 'tttt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-21 09:13:59', '2024-03-21 09:13:59'),
(7, 19, 'ttttt', 'kkk demo2', NULL, '2024-03-02', '0364877525', 'dothanhnhan20k@gmail.com', 'uuuu ggg', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s', 'http://localhost:8000/storage/avatar_images/avatar_candidate__19', 'axxxxxxxxxxxxx', 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-21 09:14:15', '2024-03-21 09:14:15'),
(8, 20, 'hoso1', 'demoweb demoweb', NULL, '2024-03-15', '0987666642', 'demoweb@gmail.com', 'khu pho 3 an phu quan 2', 'https://www.youtube.com/watch?v=iNXUxqy1svM&t=11s', 'http://localhost:8000/storage/avatar_images/avatar_candidate__20', 'abcdef...................', 'Thông tin cá nhân', 'Mục tiêu nghề nghiệp', 'Học vấn', 'Kinh nghiệm làm việc', 'Dự án', 'Các kỹ năng', 'Chứng chỉ', 'Giải thưởng', 'Hoạt động', NULL, '[\"personal\",\"objective\",\"skill\",\"certificate\",\"prize\",\"other\",\"education\",\"experience\",\"project\",\"activity\"]', '2024-03-21 11:21:45', '2024-03-21 11:21:45');

-- --------------------------------------------------------

--
-- Table structure for table `saved_jobs`
--

CREATE TABLE `saved_jobs` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `job_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_jobs`
--

INSERT INTO `saved_jobs` (`candidate_id`, `job_id`) VALUES
(19, 28),
(20, 1),
(20, 4);

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `candidate_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proficiency` tinyint(3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` tinyint(3) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `email_verified_at`, `password`, `remember_token`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'phu@gmail.com', NULL, '$2y$10$E9x/ItzPtu29nwtIfH9Gue.ghIfaq6QW1lwczr5ryT4giwr0Rg4ky', NULL, 1, 1, NULL, NULL),
(2, 'thoa@gmail.com', NULL, '$2y$10$E9x/ItzPtu29nwtIfH9Gue.ghIfaq6QW1lwczr5ryT4giwr0Rg4ky', NULL, 1, 1, NULL, NULL),
(3, 'diep@gmail.com', NULL, '$2y$10$tltltbVBlcbPM16B1UaxZuy9P43cfZdPI86x2/juj0C5VmwRmMFOa', NULL, 1, 1, NULL, NULL),
(4, 'phong@gmail.com', NULL, '$2y$10$v7F014VDFbNh6mYzZhamb.3Hg00pBt0HPauj4sEp/acRpcac3PEVG', NULL, 1, 1, NULL, NULL),
(5, 'huy@gmail.com', NULL, '$2y$10$E9x/ItzPtu29nwtIfH9Gue.ghIfaq6QW1lwczr5ryT4giwr0Rg4ky', NULL, 2, 1, NULL, NULL),
(6, 'ngoc@gmail.com', NULL, '$2y$10$YEm8I6c5vifxm59WJBjR1eNjobhuwXMsxwclfrjbXcDUI2DCGYPfy', NULL, 0, 1, NULL, NULL),
(7, 'company1@gmail.com', NULL, '$2y$10$xqQKp0aaLiGVNUQs1GDQaOyLyHC9y9.mSQRWXzkMOCn6XjoHVbcv6', NULL, 2, 1, NULL, NULL),
(8, 'company2@gmail.com', NULL, '$2y$10$YEm8I6c5vifxm59WJBjR1eNjobhuwXMsxwclfrjbXcDUI2DCGYPfy', NULL, 2, 1, NULL, NULL),
(9, 'company3@gmail.com', NULL, '$2y$10$f59KwyAQGj.T7U9DQeKbuOkx2kpyGNPI4x/rCl6P6kIAFLzSFQ8jW', NULL, 2, 1, NULL, NULL),
(10, 'company4@gmail.com', NULL, '$2y$10$EsOav.xF4vA0DaUNS7ZWLuZTZlZLwlIGZZ.Q1lSJHn7lWE6N/Mnpu', NULL, 2, 1, NULL, NULL),
(11, 'company5@gmail.com', NULL, '$2y$10$t1GBIDQ1/QnOADmYWLGQpOmVR1GaOC509bfhDdohtsZBiXKMm5p52', NULL, 2, 1, NULL, NULL),
(12, 'company6@gmail.com', NULL, '$2y$10$KgWKuitp8t83v92QfsU9T.eZkgc8gKDgM6yO1ezDEcm4/.LXXTyk6', NULL, 2, 1, NULL, NULL),
(13, 'company7@gmail.com', NULL, '$2y$10$fjqgZVfKhndmhrFW6ZPGkOUeWsgmq96tqNa.sNvwRszZG09tkvjQS', NULL, 2, 1, NULL, NULL),
(14, 'company8@gmail.com', NULL, '$2y$10$ZsouCcHoo.hint.RDVzppOsQ9GUQvuS8LnoPUndYRMXnHNVl4dZVq', NULL, 2, 1, NULL, NULL),
(15, 'company9@gmail.com', NULL, '$2y$10$uh7gk7E4WfSpmxNIgmLH0ee7bBLxuf.xmJS3CNSD9IB3hhJ3ApIaa', NULL, 2, 1, NULL, NULL),
(16, 'company10@gmail.com', NULL, '$2y$10$Tq/3QNZSRZLYod3TBqx1leJ31B3gtxk3yR8HKGEwRjDhz1pQEy.0S', NULL, 2, 1, NULL, NULL),
(17, 'quang@gmail.com', NULL, '$2y$10$nKmCC0JoBJavcF2EDXQKxeTQ8undzieImTrko.F5JSrxcl.U/nPBe', NULL, 1, 1, NULL, NULL),
(18, 'nnnnnn@gmail.com', NULL, '$2y$10$E9x/ItzPtu29nwtIfH9Gue.ghIfaq6QW1lwczr5ryT4giwr0Rg4ky', NULL, 2, 1, '2024-03-20 15:20:35', '2024-03-20 15:20:35'),
(19, 'phamleanhtuyet20@gmail.com', NULL, '$2y$10$c3XME9taHlBRt3r/KJp3yeAt/gcygfsubmKkW9mvHr50gSDmvZVNa', NULL, 1, 1, '2024-03-21 09:07:26', '2024-03-21 09:07:26'),
(20, 'phamthingocngan98@gmail.com', NULL, '$2y$10$hxsw/2Xthx9hTN.B2bH9PeZN/7Iv.MmAL0dvK9ZkKKts6yrB.MTaC', NULL, 1, 1, '2024-03-21 11:18:05', '2024-03-21 11:18:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `candidate_messages`
--
ALTER TABLE `candidate_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `educations`
--
ALTER TABLE `educations`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `employers`
--
ALTER TABLE `employers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employer_location`
--
ALTER TABLE `employer_location`
  ADD PRIMARY KEY (`employer_id`,`location_id`);

--
-- Indexes for table `experiences`
--
ALTER TABLE `experiences`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `industries`
--
ALTER TABLE `industries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jlevels`
--
ALTER TABLE `jlevels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `job_applying`
--
ALTER TABLE `job_applying`
  ADD PRIMARY KEY (`job_id`,`candidate_id`);

--
-- Indexes for table `job_industry`
--
ALTER TABLE `job_industry`
  ADD PRIMARY KEY (`job_id`,`industry_id`);

--
-- Indexes for table `job_location`
--
ALTER TABLE `job_location`
  ADD PRIMARY KEY (`job_id`,`location_id`);

--
-- Indexes for table `job_skill`
--
ALTER TABLE `job_skill`
  ADD PRIMARY KEY (`job_id`,`skill_id`);

--
-- Indexes for table `job_tag`
--
ALTER TABLE `job_tag`
  ADD PRIMARY KEY (`job_id`,`tag_id`);

--
-- Indexes for table `jskills`
--
ALTER TABLE `jskills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jtags`
--
ALTER TABLE `jtags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jtypes`
--
ALTER TABLE `jtypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `others`
--
ALTER TABLE `others`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `prizes`
--
ALTER TABLE `prizes`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `resumes`
--
ALTER TABLE `resumes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saved_jobs`
--
ALTER TABLE `saved_jobs`
  ADD PRIMARY KEY (`candidate_id`,`job_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`candidate_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `candidate_messages`
--
ALTER TABLE `candidate_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `industries`
--
ALTER TABLE `industries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `jlevels`
--
ALTER TABLE `jlevels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `jskills`
--
ALTER TABLE `jskills`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jtags`
--
ALTER TABLE `jtags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jtypes`
--
ALTER TABLE `jtypes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `others`
--
ALTER TABLE `others`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resumes`
--
ALTER TABLE `resumes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
