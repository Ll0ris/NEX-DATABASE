-- SQL Script to create works table for NEX Database
-- This table stores user works/publications/projects

CREATE TABLE IF NOT EXISTS works (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(500) NOT NULL,
    subject TEXT NOT NULL,
    year INT NOT NULL,
    authors TEXT,
    link VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_user_id (user_id),
    INDEX idx_year (year),
    INDEX idx_created_at (created_at)
);

-- Add some sample data (optional - remove in production)
-- This is just for testing purposes
/*
INSERT INTO works (user_id, name, subject, year, authors, link) VALUES
(1, 'Yapay Zeka ve Makine Öğrenmesi Uygulamaları', 'Bu çalışmada modern yapay zeka tekniklerinin endüstriyel uygulamaları incelenmiştir. Özellikle doğal dil işleme ve görüntü tanıma sistemleri üzerinde durulmuştur.', 2023, 'Prof. Dr. Ahmet Yılmaz, Dr. Mehmet Kaya', 'https://example.com/paper1'),
(1, 'Sürdürülebilir Enerji Sistemleri', 'Yenilenebilir enerji kaynaklarının entegrasyonu ve akıllı şebeke sistemleri konularında kapsamlı bir araştırma yapılmıştır.', 2022, 'Prof. Dr. Ahmet Yılmaz, Dr. Fatma Demir, Yrd. Doç. Dr. Ali Kaya', 'https://example.com/paper2'),
(1, 'Blockchain Teknolojisi ve Güvenlik', 'Blockchain teknolojisinin cybersecurity alanındaki uygulamaları ve gelecekteki potansiyeli araştırılmıştır.', 2021, 'Prof. Dr. Ahmet Yılmaz', NULL);
*/
