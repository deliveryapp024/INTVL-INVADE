import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;
const MOCK_DB = process.env.MOCK_DB === 'true';

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🛠️  Mock Mode: ${MOCK_DB ? 'ENABLED' : 'DISABLED'}`);
  console.log(`=============================================`);
});