const mineflayer = require('mineflayer');
const readline = require('readline');

// ===== CONFIG JO TU CHANGE KAR SAKTA HAI =====
const SERVER_HOST     = 'OreSMPSeason9.aternos.me';
const SERVER_PORT     = 47257;
const BOT_USERNAME    = 'NoTmeowl1';
const MC_VERSION      = '1.16.5';
const DEFAULT_COMMAND = '/register ajjubai94';

// yahan se random chat ON/OFF karo
const ENABLE_RANDOM_CHAT = true;    // true = on, false = off

const OWNER_NAME      = 'NoTmeowl';
// ============================================

function createBot () {
  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_USERNAME,
    version: MC_VERSION
  });

  // Console se chat
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('line', (input) => {
    const msg = input.trim();
    if (msg) bot.chat(msg);
    rl.prompt();
  });
  rl.prompt();

  bot.on('spawn', () => {
    console.log('Bot is online');

    // 2 ghante me ek baar auto reconnect
    setInterval(() => {
      console.log('2 hours passed, restarting bot...');
      bot.end('Scheduled restart');
    }, 2 * 60 * 60 * 1000);

    // default command
    if (DEFAULT_COMMAND && DEFAULT_COMMAND.trim().length > 0) {
      setTimeout(() => {
        bot.chat(DEFAULT_COMMAND);
      }, 1000);
    }

    // movement
    bot.on('move', function () {
      bot.setControlState('jump', true);
      setTimeout(() => {
        bot.setControlState('jump', false);
      }, 1000);

      setTimeout(() => {
        bot.setControlState('forward', true);
        setTimeout(() => {
          bot.setControlState('forward', false);
        }, 500);
      }, 1000);

      setTimeout(() => {
        bot.setControlState('back', true);
        setTimeout(() => {
          bot.setControlState('back', false);
        }, 500);
      }, 2000);

      setTimeout(() => {
        bot.setControlState('right', true);
        setTimeout(() => {
          bot.setControlState('right', false);
        }, 2000);
      }, 500);

      setTimeout(() => {
        bot.setControlState('left', true);
        setTimeout(() => {
          bot.setControlState('left', false);
        }, 2000);
      }, 500);
    });

    // auto random chat (switch se controlled)
    if (ENABLE_RANDOM_CHAT) {
      setInterval(() => {
        const chats = ['mining afk', 'brb', 'lag', 'gf', 'wp'];
        const msg = chats[Math.floor(Math.random() * chats.length)];
        bot.chat(msg);
      }, 30000 + Math.random() * 60000);
    }

    // === Break + Place block loop (every 10 minutes) ===
    setInterval(async () => {
      try {
        bot.clearControlStates(); // ruk ja thodi der

        const basePos = bot.entity.position.offset(0, -1, 0);
        const block = bot.blockAt(basePos);
        if (!block || block.type === 0) {
          console.log('No block under bot');
          return;
        }

        console.log('Trying to break:', block.name);
        await bot.dig(block); // break karega

        // block.name -> item.name mapping (grass_block -> dirt, etc.)
        let targetItemName = block.name;
        if (block.name === 'grass_block') targetItemName = 'dirt';

        const item = bot.inventory.items().find(i => i.name === targetItemName);
        if (!item) {
          console.log('Item not in inventory (mapped):', targetItemName);
          return;
        }

        await bot.equip(item, 'hand');

        const ref = bot.blockAt(basePos.offset(0, -1, 0));
        if (!ref) {
          console.log('No ref block to place on');
          return;
        }

        await bot.placeBlock(ref, { x: 0, y: 1, z: 0 });
        console.log('Placed back item:', targetItemName);
      } catch (e) {
        console.log('Place loop error:', e.message);
      }
    }, 10 * 60 * 1000); // 10 minutes
  });

  // Game se control: OWNER_NAME likhe "!bot msg"
  bot.on('chat', (username, message) => {
    if (username === OWNER_NAME && message.startsWith('!bot ')) {
      const msg = message.substring(5).trim();
      if (msg.length > 0) bot.chat(msg);
    }
  });

  // Logs + auto rejoin
  bot.on('kicked', console.log);
  bot.on('error', console.log);
  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting in 5s...');
    setTimeout(createBot, 5000);
  });
}

createBot();
