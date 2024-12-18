CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Memory_Capsules (
    capsule_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    unlock_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Sealed', 'Open') DEFAULT 'Sealed',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE Media (
    media_id INT PRIMARY KEY AUTO_INCREMENT,
    capsule_id INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    media_type ENUM('Image', 'Video', 'Audio', 'Text') NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (capsule_id) REFERENCES Memory_Capsules(capsule_id) ON DELETE CASCADE
);

CREATE TABLE Shared_Capsules (
    share_id INT PRIMARY KEY AUTO_INCREMENT,
    capsule_id INT NOT NULL,
    shared_with_email VARCHAR(255) NOT NULL,
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notification_status ENUM('Sent', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (capsule_id) REFERENCES Memory_Capsules(capsule_id) ON DELETE CASCADE
);


CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    capsule_id INT NOT NULL,
    notification_type ENUM('Upcoming', 'Open Reminder') NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Sent', 'Pending') DEFAULT 'Pending',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (capsule_id) REFERENCES Memory_Capsules(capsule_id) ON DELETE CASCADE
);

