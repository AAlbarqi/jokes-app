DROP TABLE IF EXISTS jokes;

CREATE TABLE jokes(
    id VARCHAR(255),
    type VARCHAR(255),
    setup VARCHAR(255),
    punchline TEXT
);
