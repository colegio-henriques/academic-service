-- Esquema Académico
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    iam_user_id UUID, -- Referência lógica ao iam-service
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id),
    academic_year VARCHAR(9) NOT NULL, -- Ex: 2026/2027
    grade_level VARCHAR(50) NOT NULL, -- Ex: 10º Ano
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'concluded', 'transferred')),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
