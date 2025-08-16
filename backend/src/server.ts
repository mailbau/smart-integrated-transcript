import app from './app';
import { env } from './config/env';

app.listen(Number(env.port), () => {
  console.log(`API listening on :${env.port}`);
});
