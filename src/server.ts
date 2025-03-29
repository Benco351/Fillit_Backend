import app from './app';
// import { connectMongoDB, connectPostgres } from './config/database';
import dotenv from 'dotenv';

dotenv.config();

const PORT: number = parseInt(process.env.PORT || '3000', 10); 
console.log(process.env.PORT);//UNDEFIEND

(async () => {
  // Connect to both databases before starting the server
  // await connectMongoDB(); 
  // await connectPostgres();

  app.listen(PORT, () => {
    console.log(`Server  a is running on port ${PORT}`);
  });
})();