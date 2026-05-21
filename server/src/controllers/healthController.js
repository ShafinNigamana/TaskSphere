import { getMongoHealthStatus } from '../config/mongo.js';
import { getMySQLHealthStatus } from '../config/mysql.js';

export const getHealthStatus = async (req, res) => {
  const [mongo, mysql] = await Promise.all([getMongoHealthStatus(), getMySQLHealthStatus()]);

  const payload = { mongo, mysql };
  const hasFailure = Object.values(payload).some((status) => status !== 'ok');

  res.status(hasFailure ? 503 : 200).json(payload);
};
