import * as dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello from TypeScript Express!' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});