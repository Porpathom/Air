const { createApp, ref, computed } = Vue;

// Constants and configurations
const API_KEY = '71434f5b-1e8f-4cf9-b2e3-4c4059fc8040';
const POLLUTANT_THRESHOLDS = {
    pm25: { good: 12, moderate: 35.4, unhealthy: 55.4, veryUnhealthy: 150.4, hazardous: 250.4 },
    pm10: { good: 54, moderate: 154, unhealthy: 254, veryUnhealthy: 354, hazardous: 424 },
    o3: { good: 54, moderate: 124, unhealthy: 164, veryUnhealthy: 204, hazardous: 404 },
    no2: { good: 53, moderate: 100, unhealthy: 360, veryUnhealthy: 649, hazardous: 1249 },
    so2: { good: 35, moderate: 75, unhealthy: 185, veryUnhealthy: 304, hazardous: 604 },
    co: { good: 4.4, moderate: 9.4, unhealthy: 12.4, veryUnhealthy: 15.4, hazardous: 30.4 }
};

// Main application
createApp({
    data() {
        return {
            apiKey: API_KEY,
            searchTerm: '',
            selectedProvince: '',
            showDropdown: false,
            airQuality: null,
            error: null,
            loading: false,
            provinces: 
            [
                        'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น',
                        'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ',
                        'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด',
                        'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา',
                        'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
                        'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี',
                        'ปัตตานี', 'พระนครศรีอยุธยา', 'พังงา', 'พัทลุง', 'พิจิตร',
                        'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'พะเยา',
                        'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยะลา',
                        'ยโสธร', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
                        'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ',
                        'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
                        'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย',
                        'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู',
                        'อ่างทอง', 'อุดรธานี', 'อุทัยธานี', 'อุตรดิตถ์', 'อุบลราชธานี',
                        'อำนาจเจริญ', 'กรุงเทพมหานคร'
                ],
            provinceMap: {
                'กระบี่': { state: 'Krabi', city: 'Krabi' },
                'กาญจนบุรี': { state: 'Kanchanaburi', city: 'Kanchanaburi' },
                'กาฬสินธุ์': { state: 'Kalasin', city: 'Kalasin' },
                'กำแพงเพชร': { state: 'Kamphaeng Phet', city: 'Kamphaeng Phet' },
                'ขอนแก่น': { state: 'Khon Kaen', city: 'Khon Kaen' },
                'จันทบุรี': { state: 'Chanthaburi', city: 'Chanthaburi' },
                'ฉะเชิงเทรา': { state: 'Chachoengsao', city: 'Chachoengsao' },
                'ชลบุรี': { state: 'Chonburi', city: 'Chonburi' },
                'ชัยนาท': { state: 'Chai Nat', city: 'Chai Nat' },
                'ชัยภูมิ': { state: 'Chaiyaphum', city: 'Chaiyaphum' },
                'ชุมพร': { state: 'Chumphon', city: 'Chumphon' },
                'เชียงราย': { state: 'Chiang Rai', city: 'Chiang Rai' },
                'เชียงใหม่': { state: 'Chiang Mai', city: 'Chiang Mai' },
                'ตรัง': { state: 'Trang', city: 'Trang' },
                'ตราด': { state: 'Trat', city: 'Trat' },
                'ตาก': { state: 'Tak', city: 'Tak' },
                'นครนายก': { state: 'Nakhon Nayok', city: 'Nakhon Nayok' },
                'นครปฐม': { state: 'Nakhon Pathom', city: 'Nakhon Pathom' },
                'นครพนม': { state: 'Nakhon Phanom', city: 'Nakhon Phanom' },
                'นครราชสีมา': { state: 'Nakhon Ratchasima', city: 'Nakhon Ratchasima' },
                'นครศรีธรรมราช': { state: 'Nakhon Si Thammarat', city: 'Nakhon Si Thammarat' },
                'นครสวรรค์': { state: 'Nakhon Sawan', city: 'Nakhon Sawan' },
                'นนทบุรี': { state: 'Nonthaburi', city: 'Nonthaburi' },
                'นราธิวาส': { state: 'Narathiwat', city: 'Narathiwat' },
                'น่าน': { state: 'Nan', city: 'Nan' },
                'บึงกาฬ': { state: 'Bueng Kan', city: 'Bueng Kan' },
                'บุรีรัมย์': { state: 'Buriram', city: 'Buriram' },
                'ปทุมธานี': { state: 'Pathum Thani', city: 'Pathum Thani' },
                'ประจวบคีรีขันธ์': { state: 'Prachuap Khiri Khan', city: 'Prachuap Khiri Khan' },
                'ปราจีนบุรี': { state: 'Prachinburi', city: 'Prachinburi' },
                'ปัตตานี': { state: 'Pattani', city: 'Pattani' },
                'พระนครศรีอยุธยา': { state: 'Ayutthaya', city: 'Ayutthaya' },
                'พังงา': { state: 'Phang Nga', city: 'Phang Nga' },
                'พัทลุง': { state: 'Phatthalung', city: 'Phatthalung' },
                'พิจิตร': { state: 'Phichit', city: 'Phichit' },
                'พิษณุโลก': { state: 'Phitsanulok', city: 'Phitsanulok' },
                'เพชรบุรี': { state: 'Phetchaburi', city: 'Phetchaburi' },
                'เพชรบูรณ์': { state: 'Phetchabun', city: 'Phetchabun' },
                'แพร่': { state: 'Phrae', city: 'Phrae' },
                'พะเยา': { state: 'Phayao', city: 'Phayao' },
                'ภูเก็ต': { state: 'Phuket', city: 'Phuket' },
                'มหาสารคาม': { state: 'Maha Sarakham', city: 'Maha Sarakham' },
                'มุกดาหาร': { state: 'Mukdahan', city: 'Mukdahan' },
                'แม่ฮ่องสอน': { state: 'Mae Hong Son', city: 'Mae Hong Son' },
                'ยะลา': { state: 'Yala', city: 'Yala' },
                'ยโสธร': { state: 'Yasothon', city: 'Yasothon' },
                'ร้อยเอ็ด': { state: 'Roi Et', city: 'Roi Et' },
                'ระนอง': { state: 'Ranong', city: 'Ranong' },
                'ระยอง': { state: 'Rayong', city: 'Rayong' },
                'ราชบุรี': { state: 'Ratchaburi', city: 'Ratchaburi' },
                'ลพบุรี': { state: 'Lopburi', city: 'Lopburi' },
                'ลำปาง': { state: 'Lampang', city: 'Lampang' },
                'ลำพูน': { state: 'Lamphun', city: 'Lamphun' },
                'เลย': { state: 'Loei', city: 'Loei' },
                'ศรีสะเกษ': { state: 'Sisaket', city: 'Si Sa Ket' }, // เปลี่ยนจาก Sisaket เป็น Si Sa Ket
                'สกลนคร': { state: 'Sakon Nakhon', city: 'Sakon Nakhon' },
                'สงขลา': { state: 'Songkhla', city: 'Songkhla' },
                'สตูล': { state: 'Satun', city: 'Satun' },
                'สมุทรปราการ': { state: 'Samut Prakan', city: 'Samut Prakan' },
                'สมุทรสงคราม': { state: 'Samut Songkhram', city: 'Samut Songkhram' },
                'สมุทรสาคร': { state: 'Samut Sakhon', city: 'Samut Sakhon' },
                'สระแก้ว': { state: 'Sa Kaeo', city: 'Sa Kaeo' },
                'สระบุรี': { state: 'Saraburi', city: 'Saraburi' },
                'สิงห์บุรี': { state: 'Sing Buri', city: 'Sing Buri' },
                'สุโขทัย': { state: 'Sukhothai', city: 'Sukhothai' },
                'สุพรรณบุรี': { state: 'Suphan Buri', city: 'Suphan Buri' },
                'สุราษฎร์ธานี': { state: 'Surat Thani', city: 'Surat Thani' },
                'สุรินทร์': { state: 'Surin', city: 'Surin' },
                'หนองคาย': { state: 'Nong Khai', city: 'Nong Khai' },
                'หนองบัวลำภู': { state: 'Nong Bua Lamphu', city: 'Nong Bua Lamphu' },
                'อ่างทอง': { state: 'Ang Thong', city: 'Ang Thong' },
                'อุดรธานี': { state: 'Udon Thani', city: 'Udon Thani' },
                'อุทัยธานี': { state: 'Uthai Thani', city: 'Uthai Thani' },
                'อุตรดิตถ์': { state: 'Uttaradit', city: 'Uttaradit' },
                'อุบลราชธานี': { state: 'Ubon Ratchathani', city: 'Ubon Ratchathani' },
                'อำนาจเจริญ': { state: 'Amnat Charoen', city: 'Amnat Charoen' },
                'กรุงเทพมหานคร': { state: 'Bangkok', city: 'Bangkok' }
            },
            pollutantThresholds: POLLUTANT_THRESHOLDS
        }
    },

    computed: {
        filteredProvinces() {
            if (!this.searchTerm) return [];
            const searchLower = this.searchTerm.toLowerCase();
            return this.provinces.filter(province => 
                province.toLowerCase().includes(searchLower)
            );
        }
    },

    methods: {
        handleSearch() {
            this.showDropdown = true;
          },
      
          selectProvince(province) {
            this.searchTerm = province;
            this.selectedProvince = province;
            this.showDropdown = false;
          },
      
          
      
          // ฟังก์ชันสำหรับดึงพิกัดของจังหวัด
          async getProvinceCoordinates(provinceName) {
            // พิกัด GPS ของทุกจังหวัดในประเทศไทย
            const coordinates = {
              // ภาคกลาง
              'Bangkok': { lat: 13.7563, lon: 100.5018 },
              'Samut Prakan': { lat: 13.5990, lon: 100.5998 },
              'Nonthaburi': { lat: 13.8621, lon: 100.5143 },
              'Pathum Thani': { lat: 14.0208, lon: 100.5292 },
              'Ayutthaya': { lat: 14.3692, lon: 100.5876 },
              'Ang Thong': { lat: 14.5896, lon: 100.4545 },
              'Lopburi': { lat: 14.7995, lon: 100.6534 },
              'Sing Buri': { lat: 14.8936, lon: 100.3970 },
              'Chai Nat': { lat: 15.1851, lon: 100.1251 },
              'Saraburi': { lat: 14.5289, lon: 100.9108 },
              'Samut Songkhram': { lat: 13.4098, lon: 100.0021 },
              'Samut Sakhon': { lat: 13.5475, lon: 100.2747 },
              'Nakhon Pathom': { lat: 13.8196, lon: 100.0646 },
              
              // ภาคตะวันออก
              'Chachoengsao': { lat: 13.6904, lon: 101.0779 },
              'Prachinburi': { lat: 14.0583, lon: 101.3660 },
              'Nakhon Nayok': { lat: 14.2069, lon: 101.2130 },
              'Sa Kaeo': { lat: 13.8241, lon: 102.0645 },
              'Chonburi': { lat: 13.3611, lon: 100.9847 },
              'Rayong': { lat: 12.6833, lon: 101.2372 },
              'Chanthaburi': { lat: 12.6133, lon: 102.1036 },
              'Trat': { lat: 12.2427, lon: 102.5177 },
              
              // ภาคตะวันออกเฉียงเหนือ
              'Nakhon Ratchasima': { lat: 14.9798, lon: 102.0978 },
              'Buriram': { lat: 14.9950, lon: 103.1059 },
              'Surin': { lat: 14.8868, lon: 103.4960 },
              'Sisaket': { lat: 15.1186, lon: 104.3228 },
              'Si Sa Ket': { lat: 15.1186, lon: 104.3228 }, // ชื่อทางเลือก
              'Ubon Ratchathani': { lat: 15.2445, lon: 104.8501 },
              'Yasothon': { lat: 15.7923, lon: 104.1451 },
              'Chaiyaphum': { lat: 15.8068, lon: 102.0288 },
              'Amnat Charoen': { lat: 15.8656, lon: 104.6200 },
              'Nong Bua Lamphu': { lat: 17.2220, lon: 102.4266 },
              'Khon Kaen': { lat: 16.4419, lon: 102.8360 },
              'Udon Thani': { lat: 17.4139, lon: 102.7872 },
              'Loei': { lat: 17.4860, lon: 101.7223 },
              'Nong Khai': { lat: 17.8782, lon: 102.7453 },
              'Maha Sarakham': { lat: 16.1850, lon: 103.3029 },
              'Roi Et': { lat: 16.0538, lon: 103.6520 },
              'Kalasin': { lat: 16.4314, lon: 103.5059 },
              'Sakon Nakhon': { lat: 17.1664, lon: 104.1486 },
              'Nakhon Phanom': { lat: 17.4048, lon: 104.7690 },
              'Mukdahan': { lat: 16.5428, lon: 104.7291 },
              'Bueng Kan': { lat: 18.3609, lon: 103.6465 },
              
              // ภาคเหนือ
              'Chiang Mai': { lat: 18.7883, lon: 98.9853 },
              'Lamphun': { lat: 18.5747, lon: 99.0087 },
              'Lampang': { lat: 18.2915, lon: 99.4888 },
              'Uttaradit': { lat: 17.6200, lon: 100.0997 },
              'Phrae': { lat: 18.1445, lon: 100.1398 },
              'Nan': { lat: 18.7756, lon: 100.7727 },
              'Phayao': { lat: 19.1664, lon: 99.9003 },
              'Chiang Rai': { lat: 19.9105, lon: 99.8406 },
              'Mae Hong Son': { lat: 19.3020, lon: 98.0112 },
              'Nakhon Sawan': { lat: 15.7030, lon: 100.1371 },
              'Uthai Thani': { lat: 15.3838, lon: 100.0258 },
              'Kamphaeng Phet': { lat: 16.4827, lon: 99.5264 },
              'Tak': { lat: 16.8839, lon: 99.1259 },
              'Sukhothai': { lat: 17.0068, lon: 99.8265 },
              'Phitsanulok': { lat: 16.8298, lon: 100.2658 },
              'Phichit': { lat: 16.4429, lon: 100.3496 },
              'Phetchabun': { lat: 16.4159, lon: 101.1590 },
              
              // ภาคตะวันตก
              'Kanchanaburi': { lat: 14.0023, lon: 99.5325 },
              'Suphan Buri': { lat: 14.4744, lon: 100.1177 },
              'Ratchaburi': { lat: 13.5283, lon: 99.8131 },
              'Phetchaburi': { lat: 13.1119, lon: 99.9406 },
              'Prachuap Khiri Khan': { lat: 11.8126, lon: 99.7957 },
              
              // ภาคใต้
              'Chumphon': { lat: 10.4930, lon: 99.1800 },
              'Ranong': { lat: 9.9528, lon: 98.6084 },
              'Surat Thani': { lat: 9.1382, lon: 99.3327 },
              'Phang Nga': { lat: 8.4518, lon: 98.5255 },
              'Phuket': { lat: 7.9519, lon: 98.3381 },
              'Krabi': { lat: 8.0863, lon: 98.9063 },
              'Nakhon Si Thammarat': { lat: 8.4303, lon: 99.9630 },
              'Trang': { lat: 7.5634, lon: 99.6113 },
              'Phatthalung': { lat: 7.6166, lon: 100.0742 },
              'Satun': { lat: 6.8482, lon: 100.3155 },
              'Songkhla': { lat: 7.1905, lon: 100.5945 },
              'Pattani': { lat: 6.8691, lon: 101.2510 },
              'Yala': { lat: 6.5410, lon: 101.2809 },
              'Narathiwat': { lat: 6.4318, lon: 101.8259 }
            };
            
            if (coordinates[provinceName]) {
              return coordinates[provinceName];
            }
            
            // ถ้าไม่พบในฐานข้อมูล (อาจเป็นเพราะคำผิดหรือชื่อทางเลือก)
            // ส่งคืนพิกัดกลางประเทศไทยโดยประมาณ
            console.log(`ไม่พบพิกัดสำหรับ "${provinceName}" ใช้พิกัดกลางประเทศไทยแทน`);
            return { lat: 15.8700, lon: 100.9925 }; // พิกัดกลางประเทศไทยโดยประมาณ
          },
      
          getPollutantThai(pollutant) {
            const pollutants = {
              'pm25': 'ฝุ่น PM2.5',
              'p2': 'ฝุ่น PM2.5', // เพิ่มการแมปสำหรับ p2
              'pm10': 'ฝุ่น PM10',
              'p1': 'ฝุ่น PM10', // เพิ่มการแมปสำหรับ p1
              'o3': 'โอโซน',
              'no2': 'ไนโตรเจนไดออกไซด์',
              'so2': 'ซัลเฟอร์ไดออกไซด์',
              'co': 'คาร์บอนมอนอกไซด์'
            };
            return pollutants[pollutant] || pollutant;
          },
      
          getWindDirection(degrees) {
            const directions = ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'ตะวันออก', 'ตะวันออกเฉียงใต้',
                               'ใต้', 'ตะวันตกเฉียงใต้', 'ตะวันตก', 'ตะวันตกเฉียงเหนือ'];
            const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
            return directions[index];
          },
      
          getAqiLevel(aqi) {
            if (aqi <= 50) return 'ดี';
            if (aqi <= 100) return 'ปานกลาง';
            if (aqi <= 150) return 'ไม่ดีต่อสุขภาพ';
            if (aqi <= 200) return 'อันตราย';
            return 'อันตรายอย่างยิ่ง';
          },
      
          getAqiClass(aqi) {
            if (aqi <= 50) return 'bg-green-100 text-green-800';
            if (aqi <= 100) return 'bg-yellow-100 text-yellow-800';
            if (aqi <= 150) return 'bg-orange-100 text-orange-800';
            if (aqi <= 200) return 'bg-red-100 text-red-800';
            return 'bg-purple-100 text-purple-800';
          },
      
          getPollutantLevelClass(pollutant, value) {
            const thresholds = this.pollutantThresholds[pollutant];
            if (!thresholds) return 'bg-gray-500';
      
            if (value <= thresholds.good) return 'bg-green-500';
            if (value <= thresholds.moderate) return 'bg-yellow-500';
            if (value <= thresholds.unhealthy) return 'bg-orange-500';
            if (value <= thresholds.veryUnhealthy) return 'bg-red-500';
            return 'bg-purple-500';
          },
      
          getHealthAdvice(aqi) {
            if (aqi <= 50) return 'คุณภาพอากาศดี เหมาะสำหรับกิจกรรมกลางแจ้ง';
            if (aqi <= 100) return 'คุณภาพอากาศปานกลาง ควรลดการทำกิจกรรมกลางแจ้งที่ใช้เวลานาน';
            if (aqi <= 150) return 'คุณภาพอากาศไม่ดีต่อกลุ่มเสี่ยง ควรหลีกเลี่ยงการออกนอกอาคาร';
            if (aqi <= 200) return 'คุณภาพอากาศอยู่ในเกณฑ์อันตราย ควรหลีกเลี่ยงกิจกรรมกลางแจ้ง';
            return 'คุณภาพอากาศอันตรายมาก ไม่ควรออกนอกอาคารโดยไม่จำเป็น';
          },
      
          getHealthRecommendations(aqi) {
            if (aqi <= 50) {
              return [
                'สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ',
                'เหมาะสำหรับการออกกำลังกายกลางแจ้ง',
                'คุณภาพอากาศดีต่อสุขภาพ'
              ];
            } else if (aqi <= 100) {
              return [
                'ผู้ที่มีโรคระบบทางเดินหายใจควรลดการออกกำลังกายกลางแจ้ง',
                'ควรสังเกตอาการผิดปกติของร่างกาย',
                'ควรพกหน้ากากอนามัยติดตัว'
              ];
            } else if (aqi <= 150) {
              return [
                'หลีกเลี่ยงการออกกำลังกายกลางแจ้ง',
                'เด็ก ผู้สูงอายุ และผู้ป่วยควรอยู่ในอาคาร',
                'ควรสวมหน้ากากอนามัยเมื่อออกนอกอาคาร',
                'ปิดประตูหน้าต่างเพื่อป้องกันฝุ่นละออง'
              ];
            } else if (aqi <= 200) {
              return [
                'ทุกคนควรหลีกเลี่ยงกิจกรรมกลางแจ้ง',
                'ควรสวมหน้ากาก N95 เมื่อต้องออกนอกอาคาร',
                'ควรใช้เครื่องฟอกอากาศในอาคาร',
                'หากมีอาการผิดปกติควรพบแพทย์'
              ];
            } else {
              return [
                'งดกิจกรรมกลางแจ้งทุกชนิด',
                'สวมหน้ากาก N95 ตลอดเวลาเมื่ออยู่นอกอาคาร',
                'ผู้ป่วยและกลุ่มเสี่ยงควรย้ายไปอยู่ในพื้นที่ที่มีคุณภาพอากาศดีกว่า',
                'ติดตามประกาศเตือนจากหน่วยงานที่เกี่ยวข้อง'
              ];
            }
          },
      
          async fetchAirQuality() {
            if (!this.selectedProvince) {
              this.error = "กรุณาเลือกจังหวัด";
              return;
            }
      
            this.loading = true;
            this.error = null;
            
            const provinceData = this.provinceMap[this.selectedProvince];
            if (!provinceData) {
              this.error = `ไม่พบข้อมูลการแมปสำหรับจังหวัด ${this.selectedProvince}`;
              this.loading = false;
              return;
            }
            
            try {
              // ลองเรียก API แบบใช้ city และ state
              let url = `https://api.airvisual.com/v2/city?city=${provinceData.city}&state=${provinceData.state}&country=Thailand&key=${this.apiKey}`;
              let response = await fetch(url);
              let data = await response.json();
              
              // ถ้าไม่สำเร็จ ลองใช้ nearest_city API
              if (data.status !== "success" && data.data?.message?.includes("city_not_found")) {
                const coordinates = await this.getProvinceCoordinates(provinceData.state);
                if (coordinates) {
                  url = `https://api.airvisual.com/v2/nearest_city?lat=${coordinates.lat}&lon=${coordinates.lon}&key=${this.apiKey}`;
                  response = await fetch(url);
                  data = await response.json();
                }
              }
              
              
              if (data.status === "success") {
                const pollution = data.data.current.pollution || {};
                const weather = data.data.current.weather || {};
                
                // เพิ่มข้อมูลคุณภาพอากาศแบบละเอียด
                this.airQuality = {
                  aqi: pollution.aqius || 0,
                  main_pollutant: pollution.mainus || '',
                  pollutants: {
                    pm25: pollution.pm25 !== undefined ? pollution.pm25 : null,
                    pm10: pollution.pm10 !== undefined ? pollution.pm10 : null,
                    o3: pollution.o3 !== undefined ? pollution.o3 : null,
                    no2: pollution.no2 !== undefined ? pollution.no2 : null,
                    so2: pollution.so2 !== undefined ? pollution.so2 : null,
                    co: pollution.co !== undefined ? pollution.co : null
                  },
                  weather: {
                    temperature: weather.tp !== undefined ? weather.tp : 0,
                    pressure: weather.pr !== undefined ? weather.pr : 0,
                    humidity: weather.hu !== undefined ? weather.hu : 0,
                    wind_speed: weather.ws !== undefined ? weather.ws : 0,
                    wind_direction: weather.wd !== undefined ? weather.wd : 0,
                    precipitation: weather.ic !== undefined ? weather.ic : null
                  },
                  pollutant_details: {
                    pm25: {
                      concentration: pollution.pm25,
                      aqi: this.calculateAQI('pm25', pollution.pm25)
                    },
                    pm10: {
                      concentration: pollution.pm10,
                      aqi: this.calculateAQI('pm10', pollution.pm10)
                    },
                    o3: {
                      concentration: pollution.o3,
                      aqi: this.calculateAQI('o3', pollution.o3)
                    },
                    no2: {
                      concentration: pollution.no2,
                      aqi: this.calculateAQI('no2', pollution.no2)
                    },
                    so2: {
                      concentration: pollution.so2,
                      aqi: this.calculateAQI('so2', pollution.so2)
                    },
                    co: {
                      concentration: pollution.co,
                      aqi: this.calculateAQI('co', pollution.co)
                    }
                  },
                  station: data.data.city || this.selectedProvince,
                  timestamp: new Date().toISOString()
                };
              } else {
                this.error = `ไม่พบข้อมูลคุณภาพอากาศสำหรับจังหวัด ${this.selectedProvince} (${data.data?.message || 'ข้อผิดพลาดไม่ระบุ'})`;
              }
            } catch (err) {
              this.error = `ไม่สามารถดึงข้อมูลคุณภาพอากาศได้: ${err.message}`;
            } finally {
              this.loading = false;
            }
          },
      
          calculateAQI(pollutant, concentration) {
            if (concentration === null || concentration === undefined) return null;
            
            const thresholds = this.pollutantThresholds[pollutant];
            if (!thresholds) return null;
      
            // คำนวณ AQI ตามเกณฑ์มาตรฐาน
            const ranges = [
              { min: 0, max: thresholds.good, aqiMin: 0, aqiMax: 50 },
              { min: thresholds.good, max: thresholds.moderate, aqiMin: 51, aqiMax: 100 },
              { min: thresholds.moderate, max: thresholds.unhealthy, aqiMin: 101, aqiMax: 150 },
              { min: thresholds.unhealthy, max: thresholds.veryUnhealthy, aqiMin: 151, aqiMax: 200 },
              { min: thresholds.veryUnhealthy, max: thresholds.hazardous, aqiMin: 201, aqiMax: 300 },
              { min: thresholds.hazardous, max: Infinity, aqiMin: 301, aqiMax: 500 }
            ];
      
            for (const range of ranges) {
              if (concentration <= range.max) {
                return Math.round(
                  ((range.aqiMax - range.aqiMin) / (range.max - range.min)) *
                  (concentration - range.min) +
                  range.aqiMin
                );
              }
            }
            
            return 500; // Maximum AQI value
          }
        
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    }
}).mount('#app');