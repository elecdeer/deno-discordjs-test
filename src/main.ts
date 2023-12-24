import {
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import { generateDependencyReport } from "@discordjs/voice";

import { load } from "https://deno.land/std@0.209.0/dotenv/mod.ts";

import { voiceCmd } from "./voiceCmd.ts";

const env = await load();
const token = env["DISCORD_TOKEN"];

const guildId = env["DISCORD_GUILD_ID"];
const channelId = env["DISCORD_CHANNEL_ID"];
const appId = env["DISCORD_APP_ID"];

console.log({
  token,
  guildId,
  channelId,
  appId,
});

console.log(generateDependencyReport());

const rest = new REST().setToken(token);

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

await rest.put(
  Routes.applicationGuildCommands(appId, guildId),
  {
    body: [
      voiceCmd.slashCommand.toJSON(),
    ],
  },
).then(() => console.log("Successfully registered application commands."));

rest.get(
  Routes.applicationGuildCommands(appId, guildId),
).then((commands) => {
  console.log(commands);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  readyClient.on(Events.InteractionCreate, (interaction) => {
    console.log("interaction create", interaction);
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== "voice") return;

    console.log("voice command");

    void voiceCmd.execute(
      interaction as ChatInputCommandInteraction<"cached">,
    );
  });
});

client.login(token);

client.on(Events.Error, (error) => {
  console.error(error);
});

client.on(Events.Debug, (info) => {
  console.debug(info);
});
