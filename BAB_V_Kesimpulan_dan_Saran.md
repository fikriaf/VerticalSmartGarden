# BAB V KESIMPULAN DAN SARAN

## 5.1 Kesimpulan

Proyek Vertical Smart Garden berbasis IoT telah berhasil dikembangkan dengan mengintegrasikan mikrokontroler ESP8266 NodeMCU, sensor DHT22, sensor soil moisture, LCD 16x2 I2C, dan pompa air DC yang dikontrol melalui relay. Aplikasi web monitoring berbasis React dan TypeScript mampu menampilkan data sensor secara real-time dengan waktu respons kurang dari 200 milidetik dan uptime sistem mencapai lebih dari 95%. Sistem penyiraman otomatis berbasis threshold kelembaban tanah berfungsi dengan baik, memungkinkan perawatan tanaman yang efisien tanpa memerlukan intervensi manual secara terus-menerus.

Pemanfaatan botol plastik bekas sebagai wadah tanam dalam struktur vertical garden memberikan kontribusi nyata terhadap pengurangan limbah plastik sekaligus menciptakan ruang hijau di lingkungan kampus. Pendekatan ini mendukung pencapaian Sustainable Development Goals khususnya SDG 11 (Kota dan Komunitas Berkelanjutan), SDG 12 (Konsumsi dan Produksi yang Bertanggung Jawab), dan SDG 13 (Penanganan Perubahan Iklim). Secara keseluruhan, proyek ini membuktikan bahwa teknologi IoT dapat diimplementasikan secara efektif untuk mendukung pertanian vertikal yang berkelanjutan dengan biaya terjangkau.

## 5.2 Saran

Berdasarkan hasil evaluasi dan keterbatasan yang ditemukan selama pengembangan proyek, berikut adalah saran untuk pengembangan lebih lanjut:

1. **Integrasi Platform Cloud**: Mengintegrasikan sistem dengan platform cloud seperti ThingSpeak, Firebase, atau AWS IoT untuk penyimpanan data historis jangka panjang. Hal ini memungkinkan analisis tren pertumbuhan tanaman dan optimasi parameter penyiraman berdasarkan data historis.

2. **Penambahan Fitur Notifikasi**: Mengembangkan sistem notifikasi push melalui aplikasi mobile, email, atau Telegram bot untuk memberikan peringatan kepada pengguna ketika kondisi tanaman memerlukan perhatian khusus, seperti suhu ekstrem atau kelembaban tanah yang terlalu rendah.

3. **Ekspansi Sensor**: Menambahkan sensor pendukung seperti sensor cahaya (LDR), sensor pH tanah, dan sensor level air pada reservoir menggunakan multiplexer analog untuk mengatasi keterbatasan pin analog ESP8266. Informasi tambahan ini dapat meningkatkan akurasi kontrol otomatis.

4. **Implementasi Machine Learning**: Mengembangkan model prediktif berbasis machine learning untuk memprediksi kebutuhan penyiraman berdasarkan pola data historis, kondisi cuaca, dan karakteristik tanaman. Pendekatan ini dapat meningkatkan efisiensi penggunaan air secara signifikan.

5. **Pengembangan Aplikasi Mobile Native**: Membuat aplikasi mobile native untuk Android dan iOS yang dapat memberikan pengalaman pengguna yang lebih baik dibandingkan aplikasi web, termasuk fitur notifikasi push dan akses offline untuk melihat data terakhir.

6. **Skalabilitas Sistem**: Merancang arsitektur sistem yang mendukung multiple node vertical garden dalam satu jaringan, memungkinkan monitoring dan kontrol terpusat untuk implementasi skala besar di seluruh area kampus.

7. **Dokumentasi dan Edukasi**: Menyusun modul edukasi lengkap tentang pembuatan dan pemeliharaan vertical smart garden untuk disebarluaskan kepada civitas akademika dan masyarakat umum, sehingga proyek ini dapat direplikasi dan memberikan dampak yang lebih luas.

8. **Optimasi Konsumsi Energi**: Mengimplementasikan mode deep sleep pada ESP8266 untuk menghemat konsumsi energi, terutama jika sistem akan dioperasikan menggunakan panel surya atau baterai untuk mendukung keberlanjutan energi.
