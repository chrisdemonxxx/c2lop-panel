import cors from 'cors';

const allowedOrigins = [
  'http://104.207.148.168:3000', // deployed frontend
  'http://localhost:3000'       // local development
];

export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
};

export default cors(corsOptions);
