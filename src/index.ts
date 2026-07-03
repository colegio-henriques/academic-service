import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { query } from './config/db';
import { publishEvent, TOPIC_STUDENT_ENROLLED } from './config/pubsub';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8081;

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: 'academic-service' });
});

// Endpoint para matricular um aluno (Command)
app.post('/students/enroll', async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, date_of_birth, academic_year, grade_level } = req.body;

    // 1. Gravação no Serviço Académico (PostgreSQL Local)
    const studentResult = await query(
      `INSERT INTO students (first_name, last_name, date_of_birth) 
       VALUES ($1, $2, $3) RETURNING id`,
      [first_name, last_name, date_of_birth]
    );
    const studentId = studentResult.rows[0].id;

    const enrollmentResult = await query(
      `INSERT INTO enrollments (student_id, academic_year, grade_level) 
       VALUES ($1, $2, $3) RETURNING id`,
      [studentId, academic_year, grade_level]
    );
    const enrollmentId = enrollmentResult.rows[0].id;

    // 2. Comunicação Assíncrona (Pub/Sub)
    // Desacoplamento: Notifica outros micro-serviços que a matrícula ocorreu
    await publishEvent(TOPIC_STUDENT_ENROLLED, {
      student_id: studentId,
      enrollment_id: enrollmentId,
      first_name,
      last_name,
      academic_year,
      grade_level,
      timestamp: new Date().toISOString()
    });

    // 3. Resposta Imediata ao Cliente
    res.status(201).json({
      message: 'Matrícula efectuada com sucesso.',
      student_id: studentId,
      enrollment_id: enrollmentId
    });

  } catch (error) {
    console.error('Erro ao matricular aluno:', error);
    res.status(500).json({ error: 'Falha interna ao processar matrícula.' });
  }
});

app.listen(PORT, () => {
  console.log(`[academic-service] Servidor a correr na porta ${PORT}`);
});
