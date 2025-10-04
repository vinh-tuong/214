/* Source: https://thanhmaihsk.edu.vn/214-bo-thu-tieng-trung-thong-dung-y-nghia-va-cach-hoc-de-nho/ */
const RADICALS = [
  {
    "stt": 1,
    "boThu": "一",
    "tenBoThu": "Nhất",
    "phienAm": "yi",
    "yNghia": "số một",
    "soNet": 1,
    "ghepTu": []
  },
  {
    "stt": 2,
    "boThu": "〡",
    "tenBoThu": "Cổn",
    "phienAm": "gǔn",
    "yNghia": "nét sổ",
    "soNet": 1,
    "ghepTu": []
  },
  {
    "stt": 3,
    "boThu": "丶",
    "tenBoThu": "Chủ",
    "phienAm": "zhǔ",
    "yNghia": "điểm, chấm",
    "soNet": 1,
    "ghepTu": []
  },
  {
    "stt": 4,
    "boThu": "丿",
    "tenBoThu": "Phiệt",
    "phienAm": "piě",
    "yNghia": "nét sổ xiên qua trái",
    "soNet": 1,
    "ghepTu": []
  },
  {
    "stt": 5,
    "boThu": "乙",
    "tenBoThu": "Ất",
    "phienAm": "yǐ",
    "yNghia": "vị trí thứ hai trong thiên can",
    "soNet": 1,
    "ghepTu": []
  },
  {
    "stt": 6,
    "boThu": "亅",
    "tenBoThu": "Quyết",
    "phienAm": "jué",
    "yNghia": "nét sổ có móc",
    "soNet": 1,
    "ghepTu": []
  },
  {
    "stt": 7,
    "boThu": "二",
    "tenBoThu": "Nhị",
    "phienAm": "ér",
    "yNghia": "Số hai",
    "soNet": 2,
    "ghepTu": [1, 1]
  },
  {
    "stt": 8,
    "boThu": "亠",
    "tenBoThu": "Đầu",
    "phienAm": "tóu",
    "yNghia": "Không có ý nghĩa",
    "soNet": 2,
    "ghepTu": [3, 1]
  },
  {
    "stt": 9,
    "boThu": "人 (亻)",
    "tenBoThu": "Nhân",
    "phienAm": "rén",
    "yNghia": "Người",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 10,
    "boThu": "儿",
    "tenBoThu": "Nhi",
    "phienAm": "ér",
    "yNghia": "Trẻ con",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 11,
    "boThu": "入",
    "tenBoThu": "Nhập",
    "phienAm": "rù",
    "yNghia": "Vào",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 12,
    "boThu": "八",
    "tenBoThu": "Bát",
    "phienAm": "bā",
    "yNghia": "Số tám",
    "soNet": 2,
    "ghepTu": [4, 4]
  },
  {
    "stt": 13,
    "boThu": "冂",
    "tenBoThu": "Quynh",
    "phienAm": "jiǒng",
    "yNghia": "Vùng biên giới xa; hoang địa",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 14,
    "boThu": "冖",
    "tenBoThu": "Mịch",
    "phienAm": "mì",
    "yNghia": "Trùm khăn lên",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 15,
    "boThu": "冫",
    "tenBoThu": "Băng",
    "phienAm": "bīng",
    "yNghia": "Nước đá",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 16,
    "boThu": "几",
    "tenBoThu": "Kỷ",
    "phienAm": "jī",
    "yNghia": "Ghế dựa",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 17,
    "boThu": "凵",
    "tenBoThu": "Khảm",
    "phienAm": "kǎn",
    "yNghia": "Há miệng",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 18,
    "boThu": "刀 (刂)",
    "tenBoThu": "Đao",
    "phienAm": "dāo",
    "yNghia": "Con dao, cây đao (vũ khí)",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 19,
    "boThu": "力",
    "tenBoThu": "Lực",
    "phienAm": "lì",
    "yNghia": "Sức mạnh",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 20,
    "boThu": "勹",
    "tenBoThu": "Bao",
    "phienAm": "bā",
    "yNghia": "Bao bọc",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 21,
    "boThu": "匕",
    "tenBoThu": "Chuỷ",
    "phienAm": "bǐ",
    "yNghia": "Cái thìa (cái muỗng)",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 22,
    "boThu": "匚",
    "tenBoThu": "Phương",
    "phienAm": "fāng",
    "yNghia": "Tủ đựng",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 23,
    "boThu": "匸",
    "tenBoThu": "Hệ",
    "phienAm": "xǐ",
    "yNghia": "Che đậy, giấu giếm",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 24,
    "boThu": "十",
    "tenBoThu": "Thập",
    "phienAm": "shí",
    "yNghia": "Số mười",
    "soNet": 2,
    "ghepTu": [1, 2]
  },
  {
    "stt": 25,
    "boThu": "卜",
    "tenBoThu": "Bốc",
    "phienAm": "bǔ",
    "yNghia": "Xem bói",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 26,
    "boThu": "卩",
    "tenBoThu": "Tiết",
    "phienAm": "jié",
    "yNghia": "Đốt tre",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 27,
    "boThu": "厂",
    "tenBoThu": "Hán",
    "phienAm": "hàn",
    "yNghia": "Sườn núi, vách đá",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 28,
    "boThu": "厶",
    "tenBoThu": "Khư, tư",
    "phienAm": "sī",
    "yNghia": "Riêng tư",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 29,
    "boThu": "又",
    "tenBoThu": "Hựu",
    "phienAm": "yòu",
    "yNghia": "Lại nữa, một lần nữa",
    "soNet": 2,
    "ghepTu": []
  },
  {
    "stt": 30,
    "boThu": "口",
    "tenBoThu": "Khẩu",
    "phienAm": "kǒu",
    "yNghia": "cái miệng",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 31,
    "boThu": "囗",
    "tenBoThu": "Vi",
    "phienAm": "wéi",
    "yNghia": "Vây quanh",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 32,
    "boThu": "土",
    "tenBoThu": "Thổ",
    "phienAm": "tǔ",
    "yNghia": "Đất",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 33,
    "boThu": "士",
    "tenBoThu": "Sĩ",
    "phienAm": "shì",
    "yNghia": "Kẻ sĩ",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 34,
    "boThu": "夂",
    "tenBoThu": "Tuy",
    "phienAm": "sūi",
    "yNghia": "Đi chậm",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 35,
    "boThu": "夊",
    "tenBoThu": "Truy",
    "phienAm": "zhǐ",
    "yNghia": "Đến sau",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 36,
    "boThu": "夕",
    "tenBoThu": "Tịch",
    "phienAm": "xì",
    "yNghia": "Đêm tối",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 37,
    "boThu": "大",
    "tenBoThu": "Đại",
    "phienAm": "dà",
    "yNghia": "To lớn",
    "soNet": 3,
    "ghepTu": [1, 4]
  },
  {
    "stt": 38,
    "boThu": "女",
    "tenBoThu": "Nữ",
    "phienAm": "nǚ",
    "yNghia": "Nữ giới, con gái, đàn bà",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 39,
    "boThu": "子",
    "tenBoThu": "Tử",
    "phienAm": "zǐ",
    "yNghia": "Con; tiếng tôn xưng: «Thầy», «Ngài»",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 40,
    "boThu": "宀",
    "tenBoThu": "Miên",
    "phienAm": "mián",
    "yNghia": "Mái nhà mái che",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 41,
    "boThu": "寸",
    "tenBoThu": "Thốn",
    "phienAm": "cùn",
    "yNghia": "đơn vị «tấc» (đo chiều dài)",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 42,
    "boThu": "小",
    "tenBoThu": "Tiểu",
    "phienAm": "xiǎo",
    "yNghia": "Nhỏ bé",
    "soNet": 3,
    "ghepTu": [4, 4]
  },
  {
    "stt": 43,
    "boThu": "尢",
    "tenBoThu": "Uông",
    "phienAm": "wāng",
    "yNghia": "Yếu đuối",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 44,
    "boThu": "尸",
    "tenBoThu": "Thi",
    "phienAm": "shī",
    "yNghia": "Xác chết, thây ma",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 45,
    "boThu": "屮",
    "tenBoThu": "Triệt",
    "phienAm": "chè",
    "yNghia": "Mầm non",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 46,
    "boThu": "山",
    "tenBoThu": "Sơn",
    "phienAm": "shān",
    "yNghia": "Núi non",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 47,
    "boThu": "川、巛",
    "tenBoThu": "Xuyên",
    "phienAm": "chuān",
    "yNghia": "Sông ngòi",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 48,
    "boThu": "工",
    "tenBoThu": "Công",
    "phienAm": "gōng",
    "yNghia": "Người thợ, công việc",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 49,
    "boThu": "己",
    "tenBoThu": "Kỷ",
    "phienAm": "jǐ",
    "yNghia": "Bản thân mình",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 50,
    "boThu": "巾",
    "tenBoThu": "Cân",
    "phienAm": "jīn",
    "yNghia": "Cái khăn",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 51,
    "boThu": "干",
    "tenBoThu": "Can",
    "phienAm": "gān",
    "yNghia": "Thiên can, can dự",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 52,
    "boThu": "幺",
    "tenBoThu": "Yêu",
    "phienAm": "yāo",
    "yNghia": "Nhỏ nhắn",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 53,
    "boThu": "广",
    "tenBoThu": "Nghiễm",
    "phienAm": "ān",
    "yNghia": "Mái nhà",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 54,
    "boThu": "廴",
    "tenBoThu": "Dẫn",
    "phienAm": "yǐn",
    "yNghia": "Bước dài",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 55,
    "boThu": "廾",
    "tenBoThu": "Củng",
    "phienAm": "gǒng",
    "yNghia": "Chắp tay",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 56,
    "boThu": "弋",
    "tenBoThu": "Dặc",
    "phienAm": "yì",
    "yNghia": "Bắn, chiếm lấy",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 57,
    "boThu": "弓",
    "tenBoThu": "Cung",
    "phienAm": "gōng",
    "yNghia": "Cái cung (để bắn tên)",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 58,
    "boThu": "彐",
    "tenBoThu": "Kệ",
    "phienAm": "jì",
    "yNghia": "Đầu con nhím",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 59,
    "boThu": "彡",
    "tenBoThu": "Sam",
    "phienAm": "shān",
    "yNghia": "Lông tóc dài",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 60,
    "boThu": "彳",
    "tenBoThu": "Xích",
    "phienAm": "chì",
    "yNghia": "Bước chân trái.",
    "soNet": 3,
    "ghepTu": []
  },
  {
    "stt": 61,
    "boThu": "心 (忄)",
    "tenBoThu": "Tâm",
    "phienAm": "xīn",
    "yNghia": "Quả tim, tâm trí, tấm lòng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 62,
    "boThu": "戈",
    "tenBoThu": "Qua",
    "phienAm": "gē",
    "yNghia": "Cây qua (một thứ binh khí dài)",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 63,
    "boThu": "户",
    "tenBoThu": "Hộ",
    "phienAm": "hù",
    "yNghia": "Cửa một cánh",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 64,
    "boThu": "手 (扌)",
    "tenBoThu": "Thủ",
    "phienAm": "shǒu",
    "yNghia": "Tay",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 65,
    "boThu": "支",
    "tenBoThu": "Chi",
    "phienAm": "zhī",
    "yNghia": "Cành nhánh",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 66,
    "boThu": "攴 (攵)",
    "tenBoThu": "Phộc",
    "phienAm": "pù",
    "yNghia": "Đánh khẽ",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 67,
    "boThu": "文",
    "tenBoThu": "Văn",
    "phienAm": "wén",
    "yNghia": "Nét vằn",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 68,
    "boThu": "斗",
    "tenBoThu": "Đẩu",
    "phienAm": "dōu",
    "yNghia": "Cái đấu để đong",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 69,
    "boThu": "斤",
    "tenBoThu": "Cân",
    "phienAm": "jīn",
    "yNghia": "Cái búa, rìu",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 70,
    "boThu": "方",
    "tenBoThu": "Phương",
    "phienAm": "fāng",
    "yNghia": "Vuông",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 71,
    "boThu": "无（旡）",
    "tenBoThu": "Vô",
    "phienAm": "wú",
    "yNghia": "Không",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 72,
    "boThu": "日",
    "tenBoThu": "Nhật",
    "phienAm": "rì",
    "yNghia": "Ngày, mặt trời",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 73,
    "boThu": "曰",
    "tenBoThu": "Viết",
    "phienAm": "yuē",
    "yNghia": "Nói rằng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 74,
    "boThu": "月",
    "tenBoThu": "Nguyệt",
    "phienAm": "yuè",
    "yNghia": "Tháng, mặt trăng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 75,
    "boThu": "木",
    "tenBoThu": "Mộc",
    "phienAm": "mù",
    "yNghia": "Gỗ, cây cối",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 76,
    "boThu": "欠",
    "tenBoThu": "Khiếm",
    "phienAm": "qiàn",
    "yNghia": "Khiếm khuyết, thiếu vắng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 77,
    "boThu": "止",
    "tenBoThu": "Chỉ",
    "phienAm": "zhǐ",
    "yNghia": "Dừng lại",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 78,
    "boThu": "歹",
    "tenBoThu": "Đãi",
    "phienAm": "dǎi",
    "yNghia": "Xấu xa, tệ hại",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 79,
    "boThu": "殳",
    "tenBoThu": "Thù",
    "phienAm": "shū",
    "yNghia": "Binh khí dài",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 80,
    "boThu": "毋",
    "tenBoThu": "Vô",
    "phienAm": "wú",
    "yNghia": "Chớ, đừng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 81,
    "boThu": "比",
    "tenBoThu": "Tỷ",
    "phienAm": "bǐ",
    "yNghia": "So sánh",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 82,
    "boThu": "毛",
    "tenBoThu": "Mao",
    "phienAm": "máo",
    "yNghia": "Lông",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 83,
    "boThu": "氏",
    "tenBoThu": "Thị",
    "phienAm": "shì",
    "yNghia": "Họ",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 84,
    "boThu": "气",
    "tenBoThu": "Khí",
    "phienAm": "qì",
    "yNghia": "Hơi nước",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 85,
    "boThu": "水(氵、氺)",
    "tenBoThu": "Thủy",
    "phienAm": "shǔi",
    "yNghia": "Nước",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 86,
    "boThu": "火 (灬)",
    "tenBoThu": "Hỏa",
    "phienAm": "huǒ",
    "yNghia": "Lửa",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 87,
    "boThu": "爪",
    "tenBoThu": "Trảo",
    "phienAm": "zhǎo",
    "yNghia": "Móng vuốt cầm thú",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 88,
    "boThu": "父",
    "tenBoThu": "Phụ",
    "phienAm": "fù",
    "yNghia": "Cha",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 89,
    "boThu": "爻",
    "tenBoThu": "Hào",
    "phienAm": "yáo",
    "yNghia": "Hào âm, hào dương (Kinh Dịch)",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 90,
    "boThu": "爿(丬)",
    "tenBoThu": "Tường",
    "phienAm": "qiáng",
    "yNghia": "Mảnh gỗ, cái giường",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 91,
    "boThu": "片",
    "tenBoThu": "Phiến",
    "phienAm": "piàn",
    "yNghia": "Mảnh, tấm, miếng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 92,
    "boThu": "牙",
    "tenBoThu": "Nha",
    "phienAm": "yá",
    "yNghia": "Răng",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 93,
    "boThu": "牛（牜）",
    "tenBoThu": "Ngưu",
    "phienAm": "níu",
    "yNghia": "Trâu",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 94,
    "boThu": "犬 (犭)",
    "tenBoThu": "Khuyển",
    "phienAm": "quǎn",
    "yNghia": "Con chó",
    "soNet": 4,
    "ghepTu": []
  },
  {
    "stt": 95,
    "boThu": "玄",
    "tenBoThu": "Huyền",
    "phienAm": "xuán",
    "yNghia": "Màu đen huyền, huyền bí",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 96,
    "boThu": "玉",
    "tenBoThu": "Ngọc",
    "phienAm": "yù",
    "yNghia": "Đá quý, ngọc",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 97,
    "boThu": "瓜",
    "tenBoThu": "Qua",
    "phienAm": "guā",
    "yNghia": "Quả dưa",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 98,
    "boThu": "瓦",
    "tenBoThu": "Ngõa",
    "phienAm": "wǎ",
    "yNghia": "Ngói",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 99,
    "boThu": "甘",
    "tenBoThu": "Cam",
    "phienAm": "gān",
    "yNghia": "Ngọt",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 100,
    "boThu": "生",
    "tenBoThu": "Sinh",
    "phienAm": "shēng",
    "yNghia": "Sinh sôi,nảy nở",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 101,
    "boThu": "用",
    "tenBoThu": "Dụng",
    "phienAm": "yòng",
    "yNghia": "Dùng",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 102,
    "boThu": "田",
    "tenBoThu": "Điền",
    "phienAm": "tián",
    "yNghia": "Ruộng",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 103,
    "boThu": "疋( 匹)",
    "tenBoThu": "Thất",
    "phienAm": "pǐ",
    "yNghia": "Đơn vị đo chiều dài, tấm (vải)",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 104,
    "boThu": "疒",
    "tenBoThu": "Nạch",
    "phienAm": "nǐ",
    "yNghia": "Bệnh tật",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 105,
    "boThu": "癶",
    "tenBoThu": "Bát",
    "phienAm": "bǒ",
    "yNghia": "Gạt ngược lại, trở lại",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 106,
    "boThu": "白",
    "tenBoThu": "Bạch",
    "phienAm": "bái",
    "yNghia": "Màu trắng",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 107,
    "boThu": "皮",
    "tenBoThu": "Bì",
    "phienAm": "pí",
    "yNghia": "Da",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 108,
    "boThu": "皿",
    "tenBoThu": "Mãnh",
    "phienAm": "mǐn",
    "yNghia": "Bát dĩa",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 109,
    "boThu": "目（罒）",
    "tenBoThu": "Mục",
    "phienAm": "mù",
    "yNghia": "Mắt",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 110,
    "boThu": "矛",
    "tenBoThu": "Mâu",
    "phienAm": "máo",
    "yNghia": "Cây giáo để đâm",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 111,
    "boThu": "矢",
    "tenBoThu": "Thỉ",
    "phienAm": "shǐ",
    "yNghia": "Cây tên, mũi tên",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 112,
    "boThu": "石",
    "tenBoThu": "Thạch",
    "phienAm": "shí",
    "yNghia": "Đá",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 113,
    "boThu": "示 (礻)",
    "tenBoThu": "Thị, kỳ",
    "phienAm": "shì",
    "yNghia": "Chỉ thị; thần đất",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 114,
    "boThu": "禸",
    "tenBoThu": "Nhựu",
    "phienAm": "róu",
    "yNghia": "Vết chân, lốt chân",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 115,
    "boThu": "禾",
    "tenBoThu": "Hòa",
    "phienAm": "hé",
    "yNghia": "Lúa",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 116,
    "boThu": "穴",
    "tenBoThu": "Huyệt",
    "phienAm": "xué",
    "yNghia": "Hang lỗ",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 117,
    "boThu": "立",
    "tenBoThu": "Lập",
    "phienAm": "lì",
    "yNghia": "Đứng, thành lập",
    "soNet": 5,
    "ghepTu": []
  },
  {
    "stt": 118,
    "boThu": "竹",
    "tenBoThu": "Trúc",
    "phienAm": "zhú",
    "yNghia": "Tre trúc",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 119,
    "boThu": "米",
    "tenBoThu": "Mễ",
    "phienAm": "mǐ",
    "yNghia": "Gạo",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 120,
    "boThu": "糸 (糹, 纟)",
    "tenBoThu": "Mịch",
    "phienAm": "mì",
    "yNghia": "Sợi tơ nhỏ",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 121,
    "boThu": "缶",
    "tenBoThu": "Phẫu",
    "phienAm": "fǒu",
    "yNghia": "Đồ sành",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 122,
    "boThu": "网(, 罓)",
    "tenBoThu": "Võng",
    "phienAm": "wǎng",
    "yNghia": "Cái lưới",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 123,
    "boThu": "羊",
    "tenBoThu": "Dương",
    "phienAm": "yáng",
    "yNghia": "Con dê",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 124,
    "boThu": "羽 (羽)",
    "tenBoThu": "Vũ",
    "phienAm": "yǚ",
    "yNghia": "Lông vũ",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 125,
    "boThu": "老",
    "tenBoThu": "Lão",
    "phienAm": "lǎo",
    "yNghia": "Già",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 126,
    "boThu": "而",
    "tenBoThu": "Nhi",
    "phienAm": "ér",
    "yNghia": "Mà, và",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 127,
    "boThu": "耒",
    "tenBoThu": "Lỗi",
    "phienAm": "lěi",
    "yNghia": "Cái cày",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 128,
    "boThu": "耳",
    "tenBoThu": "Nhĩ",
    "phienAm": "ěr",
    "yNghia": "Lỗ tai",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 129,
    "boThu": "聿",
    "tenBoThu": "Duật",
    "phienAm": "yù",
    "yNghia": "Cây bút",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 130,
    "boThu": "肉",
    "tenBoThu": "Nhục",
    "phienAm": "ròu",
    "yNghia": "Thịt",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 131,
    "boThu": "臣",
    "tenBoThu": "Thần",
    "phienAm": "chén",
    "yNghia": "Bầy tôi",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 132,
    "boThu": "自",
    "tenBoThu": "Tự",
    "phienAm": "zì",
    "yNghia": "Tự bản thân, kể từ",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 133,
    "boThu": "至",
    "tenBoThu": "Chí",
    "phienAm": "zhì",
    "yNghia": "Đến",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 134,
    "boThu": "臼",
    "tenBoThu": "Cữu",
    "phienAm": "jiù",
    "yNghia": "Cái cối giã gạo",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 135,
    "boThu": "舌",
    "tenBoThu": "Thiệt",
    "phienAm": "shé",
    "yNghia": "Cái lưỡi",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 136,
    "boThu": "舛",
    "tenBoThu": "Suyễn",
    "phienAm": "chuǎn",
    "yNghia": "Sai lầm",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 137,
    "boThu": "舟",
    "tenBoThu": "Chu",
    "phienAm": "zhōu",
    "yNghia": "Cái thuyền",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 138,
    "boThu": "艮",
    "tenBoThu": "Cấn",
    "phienAm": "gèn",
    "yNghia": "quẻ Cấn (Kinh Dịch), dừng, bền cứng",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 139,
    "boThu": "色",
    "tenBoThu": "Sắc",
    "phienAm": "sè",
    "yNghia": "Màu, dáng vẻ, nữ sắc",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 140,
    "boThu": "艸 (艹)",
    "tenBoThu": "Thảo",
    "phienAm": "cǎo",
    "yNghia": "Cỏ",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 141,
    "boThu": "虍",
    "tenBoThu": "Hổ",
    "phienAm": "hū",
    "yNghia": "Vằn vện của con hổ",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 142,
    "boThu": "虫",
    "tenBoThu": "Trùng",
    "phienAm": "chóng",
    "yNghia": "Sâu bọ",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 143,
    "boThu": "血",
    "tenBoThu": "Huyết",
    "phienAm": "xuè",
    "yNghia": "Máu",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 144,
    "boThu": "行",
    "tenBoThu": "Hành",
    "phienAm": "xíng",
    "yNghia": "Đi, thi hành, làm được",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 145,
    "boThu": "衣(衤)",
    "tenBoThu": "Y",
    "phienAm": "yī",
    "yNghia": "Áo",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 146,
    "boThu": "襾",
    "tenBoThu": "Á",
    "phienAm": "yà",
    "yNghia": "Che đậy, úp lên",
    "soNet": 6,
    "ghepTu": []
  },
  {
    "stt": 147,
    "boThu": "見(见)",
    "tenBoThu": "Kiến",
    "phienAm": "jiàn",
    "yNghia": "Trông thấy",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 148,
    "boThu": "角",
    "tenBoThu": "Giác",
    "phienAm": "jué",
    "yNghia": "Góc, sừng thú",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 149,
    "boThu": "言",
    "tenBoThu": "Ngôn",
    "phienAm": "yán",
    "yNghia": "Nói",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 150,
    "boThu": "谷",
    "tenBoThu": "Cốc",
    "phienAm": "gǔ",
    "yNghia": "Khe nước chảy giữa hai núi, thung lũng",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 151,
    "boThu": "豆",
    "tenBoThu": "Đậu",
    "phienAm": "dòu",
    "yNghia": "Hạt đậu, cây đậu",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 152,
    "boThu": "豕",
    "tenBoThu": "Thỉ",
    "phienAm": "shǐ",
    "yNghia": "Con heo, con lợn",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 153,
    "boThu": "豸",
    "tenBoThu": "Trãi",
    "phienAm": "zhì",
    "yNghia": "Loài sâu không chân",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 154,
    "boThu": "貝 (贝)",
    "tenBoThu": "Bối",
    "phienAm": "bèi",
    "yNghia": "Vật báu",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 155,
    "boThu": "赤",
    "tenBoThu": "Xích",
    "phienAm": "chì",
    "yNghia": "Màu đỏ",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 156,
    "boThu": "走(赱)",
    "tenBoThu": "Tẩu",
    "phienAm": "zǒu",
    "yNghia": "Đi, chạy",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 157,
    "boThu": "足",
    "tenBoThu": "Túc",
    "phienAm": "zú",
    "yNghia": "Chân, đầy đủ",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 158,
    "boThu": "身",
    "tenBoThu": "Thân",
    "phienAm": "shēn",
    "yNghia": "Thân thể, thân mình",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 159,
    "boThu": "車 (车)",
    "tenBoThu": "Xa",
    "phienAm": "chē",
    "yNghia": "Chiếc xe",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 160,
    "boThu": "辛",
    "tenBoThu": "Tân",
    "phienAm": "xīn",
    "yNghia": "Cay",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 161,
    "boThu": "辰",
    "tenBoThu": "Thần",
    "phienAm": "chén",
    "yNghia": "Nhật, nguyệt, tinh; thìn (12 chi)",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 162,
    "boThu": "辵(辶)",
    "tenBoThu": "Sước",
    "phienAm": "chuò",
    "yNghia": "Chợt bước đi chợt dừng lại",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 163,
    "boThu": "邑(阝)",
    "tenBoThu": "Ấp",
    "phienAm": "yì",
    "yNghia": "Vùng đất, đất phong cho quan",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 164,
    "boThu": "酉",
    "tenBoThu": "Dậu",
    "phienAm": "yǒu",
    "yNghia": "Một trong 12 địa chi",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 165,
    "boThu": "釆",
    "tenBoThu": "Biện",
    "phienAm": "biàn",
    "yNghia": "Phân biệt",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 166,
    "boThu": "里",
    "tenBoThu": "Lý",
    "phienAm": "lǐ",
    "yNghia": "Dặm; làng xóm",
    "soNet": 7,
    "ghepTu": []
  },
  {
    "stt": 167,
    "boThu": "金",
    "tenBoThu": "Kim",
    "phienAm": "jīn",
    "yNghia": "Kim loại nói chung, vàng",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 168,
    "boThu": "長 (镸 , 长)",
    "tenBoThu": "Trường",
    "phienAm": "cháng",
    "yNghia": "Dài, lớn (trưởng)",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 169,
    "boThu": "門 (门)",
    "tenBoThu": "Môn",
    "phienAm": "mén",
    "yNghia": "Cửa hai cánh",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 170,
    "boThu": "阜 (阝- )",
    "tenBoThu": "Phụ",
    "phienAm": "fù",
    "yNghia": "Đống đất, gò đất",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 171,
    "boThu": "隶",
    "tenBoThu": "Đãi",
    "phienAm": "dài",
    "yNghia": "Kịp, kịp đến",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 172,
    "boThu": "隹",
    "tenBoThu": "Truy,",
    "phienAm": "chuy",
    "yNghia": "zhuī Chim non",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 173,
    "boThu": "雨",
    "tenBoThu": "Vũ",
    "phienAm": "yǔ",
    "yNghia": "Mưa",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 174,
    "boThu": "青 (靑)",
    "tenBoThu": "Thanh",
    "phienAm": "qīng",
    "yNghia": "Màu xanh",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 175,
    "boThu": "非",
    "tenBoThu": "Phi",
    "phienAm": "fēi",
    "yNghia": "Không",
    "soNet": 8,
    "ghepTu": []
  },
  {
    "stt": 176,
    "boThu": "面 (靣)",
    "tenBoThu": "Diện",
    "phienAm": "miàn",
    "yNghia": "Mặt, bề mặt",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 177,
    "boThu": "革",
    "tenBoThu": "Cách",
    "phienAm": "gé",
    "yNghia": "Da thú, thay đổi",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 178,
    "boThu": "韋 (韦)",
    "tenBoThu": "Vi",
    "phienAm": "wéi",
    "yNghia": "Da đã thuộc rồi",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 179,
    "boThu": "韭",
    "tenBoThu": "Phỉ, cửu",
    "phienAm": "jiǔ",
    "yNghia": "Rau hẹ",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 180,
    "boThu": "音",
    "tenBoThu": "Âm",
    "phienAm": "yīn",
    "yNghia": "Âm thanh, tiếng",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 181,
    "boThu": "頁(页)",
    "tenBoThu": "Hiệt",
    "phienAm": "yè",
    "yNghia": "Đầu; trang giấy",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 182,
    "boThu": "風(凬, 风)",
    "tenBoThu": "Phong",
    "phienAm": "fēng",
    "yNghia": "Gió",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 183,
    "boThu": "飛 (飞 )",
    "tenBoThu": "Phi",
    "phienAm": "fēi",
    "yNghia": "Bay",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 184,
    "boThu": "食 (飠, 饣 )",
    "tenBoThu": "Thực",
    "phienAm": "shí",
    "yNghia": "Ăn",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 185,
    "boThu": "首",
    "tenBoThu": "Thủ",
    "phienAm": "shǒu",
    "yNghia": "Đầu",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 186,
    "boThu": "香",
    "tenBoThu": "Hương",
    "phienAm": "xiāng",
    "yNghia": "Mùi thơm",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 187,
    "boThu": "馬 (马)",
    "tenBoThu": "Mã",
    "phienAm": "mǎ",
    "yNghia": "Con ngựa",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 188,
    "boThu": "骨",
    "tenBoThu": "Cốt",
    "phienAm": "gǔ",
    "yNghia": "Xương",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 189,
    "boThu": "高",
    "tenBoThu": "Cao",
    "phienAm": "gāo",
    "yNghia": "Cao",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 190,
    "boThu": "髟",
    "tenBoThu": "Bưu, tiêu",
    "phienAm": "biāo",
    "yNghia": "Tóc dài",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 191,
    "boThu": "鬥 (斗)",
    "tenBoThu": "Đấu",
    "phienAm": "dòu",
    "yNghia": "Đánh nhau",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 192,
    "boThu": "鬯",
    "tenBoThu": "Sưởng",
    "phienAm": "chàng",
    "yNghia": "Ủ rượu nếp",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 193,
    "boThu": "鬲",
    "tenBoThu": "Cách",
    "phienAm": "gé",
    "yNghia": "Nồi, chõ",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 194,
    "boThu": "鬼",
    "tenBoThu": "Quỷ",
    "phienAm": "gǔi",
    "yNghia": "Con quỷ",
    "soNet": 9,
    "ghepTu": []
  },
  {
    "stt": 195,
    "boThu": "魚 (鱼)",
    "tenBoThu": "Ngư",
    "phienAm": "yú",
    "yNghia": "Con cá",
    "soNet": 11,
    "ghepTu": []
  },
  {
    "stt": 196,
    "boThu": "鳥(鸟)",
    "tenBoThu": "Điểu",
    "phienAm": "niǎo",
    "yNghia": "Con chim",
    "soNet": 11,
    "ghepTu": []
  },
  {
    "stt": 197,
    "boThu": "鹵",
    "tenBoThu": "Lỗ",
    "phienAm": "lǔ",
    "yNghia": "Đất mặn",
    "soNet": 11,
    "ghepTu": []
  },
  {
    "stt": 198,
    "boThu": "鹿",
    "tenBoThu": "Lộc",
    "phienAm": "lù",
    "yNghia": "Con hươu",
    "soNet": 11,
    "ghepTu": []
  },
  {
    "stt": 199,
    "boThu": "麥 (麦)",
    "tenBoThu": "Mạch",
    "phienAm": "mò",
    "yNghia": "Lúa mạch",
    "soNet": 11,
    "ghepTu": []
  },
  {
    "stt": 200,
    "boThu": "麻",
    "tenBoThu": "Ma",
    "phienAm": "má",
    "yNghia": "Cây gai",
    "soNet": 11,
    "ghepTu": []
  },
  {
    "stt": 201,
    "boThu": "黃",
    "tenBoThu": "Hoàng",
    "phienAm": "huáng",
    "yNghia": "Màu vàng",
    "soNet": 12,
    "ghepTu": []
  },
  {
    "stt": 202,
    "boThu": "黍",
    "tenBoThu": "Thử",
    "phienAm": "shǔ",
    "yNghia": "Lúa nếp",
    "soNet": 12,
    "ghepTu": []
  },
  {
    "stt": 203,
    "boThu": "黑",
    "tenBoThu": "Hắc",
    "phienAm": "hēi",
    "yNghia": "Màu đen",
    "soNet": 12,
    "ghepTu": []
  },
  {
    "stt": 204,
    "boThu": "黹",
    "tenBoThu": "Chỉ",
    "phienAm": "zhǐ",
    "yNghia": "May áo, khâu vá",
    "soNet": 12,
    "ghepTu": []
  },
  {
    "stt": 205,
    "boThu": "黽",
    "tenBoThu": "Mãnh",
    "phienAm": "mǐn",
    "yNghia": "Loài bò sát",
    "soNet": 13,
    "ghepTu": []
  },
  {
    "stt": 206,
    "boThu": "鼎",
    "tenBoThu": "Đỉnh",
    "phienAm": "dǐng",
    "yNghia": "Cái đỉnh",
    "soNet": 13,
    "ghepTu": []
  },
  {
    "stt": 207,
    "boThu": "鼓",
    "tenBoThu": "Cổ",
    "phienAm": "gǔ",
    "yNghia": "Cái trống",
    "soNet": 13,
    "ghepTu": []
  },
  {
    "stt": 208,
    "boThu": "鼠",
    "tenBoThu": "Thử",
    "phienAm": "shǔ",
    "yNghia": "Con chuột",
    "soNet": 13,
    "ghepTu": []
  },
  {
    "stt": 209,
    "boThu": "鼻",
    "tenBoThu": "tỵ",
    "phienAm": "bí",
    "yNghia": "cái mũi",
    "soNet": 14,
    "ghepTu": []
  },
  {
    "stt": 210,
    "boThu": "齊 (斉 , 齐)",
    "tenBoThu": "tề",
    "phienAm": "qí",
    "yNghia": "bằng nhau",
    "soNet": 14,
    "ghepTu": []
  },
  {
    "stt": 211,
    "boThu": "齒(齿, 歯 )",
    "tenBoThu": "Xỉ",
    "phienAm": "chǐ",
    "yNghia": "Răng",
    "soNet": 15,
    "ghepTu": []
  },
  {
    "stt": 212,
    "boThu": "龍(龙 )",
    "tenBoThu": "long",
    "phienAm": "lóng",
    "yNghia": "con rồng",
    "soNet": 16,
    "ghepTu": []
  },
  {
    "stt": 213,
    "boThu": "龜 (亀, 龟 )",
    "tenBoThu": "quy",
    "phienAm": "guī",
    "yNghia": "con rùa",
    "soNet": 16,
    "ghepTu": []
  },
  {
    "stt": 214,
    "boThu": "龠",
    "tenBoThu": "Dược",
    "phienAm": "yuè",
    "yNghia": "sáo ba lỗ",
    "soNet": 17,
    "ghepTu": []
  }
];

export default RADICALS;
