
import * as dotenv from 'dotenv';
dotenv.config();

import { Bot } from './bot';

const init = async () => {
  const bot = new Bot();

  try {
    await bot.init();
  } catch (e) {

    // tslint:disable-next-line:no-console
    console.error(e);

    process.exit(0);
  }
};

init();
