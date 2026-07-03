import { PubSub } from '@google-cloud/pubsub';
import dotenv from 'dotenv';

dotenv.config();

// Inicialização do cliente Pub/Sub
// Usa automaticamente as credenciais (Application Default Credentials) em GCP.
export const pubsub = new PubSub({
  projectId: process.env.GOOGLE_CLOUD_PROJECT || 'colegio-henriques-prod',
});

export const TOPIC_STUDENT_ENROLLED = 'aluno.matriculado';

// Função utilitária para publicar eventos estruturados
export const publishEvent = async (topicName: string, data: any) => {
  try {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`[Pub/Sub] Evento publicado no tópico ${topicName} (ID: ${messageId})`);
    return messageId;
  } catch (error) {
    console.error(`[Pub/Sub] Falha ao publicar evento no tópico ${topicName}:`, error);
    // Como estipulado, idealmente teríamos uma Retry Policy ou gravaríamos na base de dados (Outbox Pattern)
    throw error;
  }
};
