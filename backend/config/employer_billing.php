<?php

return [
    'currency' => 'VND',

    'plans' => [
        'starter' => [
            'name' => 'Gói Đăng Tuyển',
            'amount' => 1000,
            'duration_days' => 30,
            'job_posts' => 3,
            'candidate_search' => false,
            'features' => [
                '3 tin tuyển dụng trong 30 ngày',
                'Quản lý hồ sơ ứng tuyển',
                'Hỗ trợ thanh toán bằng VietQR',
            ],
        ],

        'growth' => [
            'name' => 'Gói Tăng Trưởng',
            'amount' => 2000,
            'duration_days' => 30,
            'job_posts' => 10,
            'candidate_search' => true,
            'features' => [
                '10 tin tuyển dụng trong 30 ngày',
                'Tìm kiếm và gợi ý ứng viên',
                'Gửi email liên hệ ứng viên',
            ],
        ],

        'pro' => [
            'name' => 'Gói Chuyên Nghiệp',
            'amount' => 3000,
            'duration_days' => 90,
            'job_posts' => 30,
            'candidate_search' => true,
            'features' => [
                '30 tin tuyển dụng trong 90 ngày',
                'Tìm kiếm và gợi ý ứng viên',
                'Phù hợp cho chiến dịch tuyển dụng dài hạn',
            ],
        ],
    ],
];
