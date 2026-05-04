import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
  type Message,
} from "discord.js";
import { getCount, getWord, setCount, setWord, increment, INT_MAX, INT_MIN } from "./counter.js";
import { normalize } from "./normalize.js";
import { logger } from "../lib/logger.js";

const TOKEN = process.env["DISCORD_BOT_TOKEN"];
const APP_ID = process.env["DISCORD_APPLICATION_ID"];

if (!TOKEN) throw new Error("DISCORD_BOT_TOKEN is required");
if (!APP_ID) throw new Error("DISCORD_APPLICATION_ID is required");

const ALLOWED_USER = "totallyhacker1";

const commands = [
  new SlashCommandBuilder()
    .setName("set")
    .setDescription(".")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((opt) =>
      opt
        .setName("value")
        .setDescription(".")
        .setRequired(true),
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("int")
    .setDescription(".")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("negint")
    .setDescription(".")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("lmao")
    .setDescription("Show the current counter")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("setword")
    .setDescription(".")
    .addStringOption((opt) =>
      opt
        .setName("word")
        .setDescription(".")
        .setRequired(true),
    )
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

async function clearGlobalCommands(): Promise<void> {
  try {
    await rest.put(Routes.applicationCommands(APP_ID!), { body: [] });
    logger.info("Cleared global slash commands");
  } catch (err) {
    logger.error({ err }, "Failed to clear global commands");
  }
}

async function registerCommandsForGuild(guildId: string): Promise<void> {
  try {
    await rest.put(Routes.applicationGuildCommands(APP_ID!, guildId), {
      body: commands,
    });
    logger.info({ guildId }, "Slash commands registered for guild");
  } catch (err) {
    logger.error({ err, guildId }, "Failed to register slash commands for guild");
  }
}

function isAllowed(cmd: ChatInputCommandInteraction): boolean {
  return cmd.user.username.toLowerCase() === ALLOWED_USER;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.Error, (err) => {
  logger.error({ err }, "Discord client error");
});

client.once(Events.ClientReady, async (c) => {
  logger.info({ tag: c.user.tag }, "Discord bot ready");
  await clearGlobalCommands();
  for (const guild of c.guilds.cache.values()) {
    await registerCommandsForGuild(guild.id);
  }
});

client.on(Events.GuildCreate, async (guild) => {
  await registerCommandsForGuild(guild.id);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return;

  const word = getWord();
  const normalizedWord = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(normalizedWord);
  if (regex.test(normalize(message.content))) {
    const newCount = increment();
    await message.channel.send(`${word} counter: **${newCount}**`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = interaction as ChatInputCommandInteraction;

  if (cmd.commandName === "set") {
    const value = cmd.options.getInteger("value", true);
    setCount(value);
    await cmd.reply(`Counter set to **${value}**`);
  }

  if (cmd.commandName === "int") {
    if (!isAllowed(cmd)) {
      await cmd.reply({ content: "u dont have perms", ephemeral: true });
      return;
    }
    setCount(INT_MAX);
    await cmd.reply(`Counter set to max int: **${INT_MAX}**`);
  }

  if (cmd.commandName === "negint") {
    if (!isAllowed(cmd)) {
      await cmd.reply({ content: "u dont have perms", ephemeral: true });
      return;
    }
    setCount(INT_MIN);
    await cmd.reply(`Counter set to min int: **${INT_MIN}**`);
  }

  if (cmd.commandName === "lmao") {
    const count = getCount();
    const word = getWord();
    await cmd.reply(`${word} counter: **${count}**`);
  }

  if (cmd.commandName === "setword") {
    if (!isAllowed(cmd)) {
      await cmd.reply({ content: "u dont have perms", ephemeral: true });
      return;
    }
    const word = cmd.options.getString("word", true);
    setWord(word);
    await cmd.reply(`Now tracking the word: **${word.toLowerCase()}**`);
  }
});

export function startBot(): void {
  client.login(TOKEN).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
  });
}
