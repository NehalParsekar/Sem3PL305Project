-- Author: Nehal Parsekar
-- Roll No: 1942

CREATE TABLE Users(
	id VARCHAR(256) PRIMARY KEY,
	userName VARCHAR(32) NOT NULL,
	userAddress VARCHAR(128) NOT NULL,
	userYear INT NOT NULL,
	userGender VARCHAR(8) NOT NULL,
	userContact VARCHAR(16) NOT NULL,
	userEmail VARCHAR(256),
	userPassword VARCHAR(256),
	createdAt TIMESTAMP NOT NULL,
	updatedAt TIMESTAMP NOT NULL,
	userType VARCHAR(8) NOT NULL
);

SELECT * FROM Users;

DESC Users;









