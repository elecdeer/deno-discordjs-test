import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import { ChatInputCommandInteraction } from "discord.js";
import { join } from "https://deno.land/std@0.210.0/path/mod.ts";

export const voiceCmd = {
  slashCommand: new SlashCommandBuilder()
    .setName("voice")
    .setDescription(
      "voice command",
    ),
  execute: async (interaction: ChatInputCommandInteraction<"cached">) => {
    console.log("voice command");

    // interaction.client.guilds.

    if (interaction.member === null || interaction.channelId === null) {
      return;
    }

    if (interaction.member.voice.channelId === null) {
      console.log("not in voice channel");
      return;
    }

    await interaction.reply("ok");
    console.log("defer reply");

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guildId,
      adapterCreator: interaction.guild?.voiceAdapterCreator,
    });

    connection.on("error", (error) => {
      console.error("connection error", error);
    });

    console.log("join voice channel");

    const player = createAudioPlayer({});
    player.on("error", (error) => {
      console.error("player error", error);
    });

    connection.subscribe(player);

    const resource = createAudioResource(
      join(Deno.cwd(), "/files/test.ogg"),
    );

    player.play(resource);

    await entersState(player, AudioPlayerStatus.Playing, 5000);

    await entersState(player, AudioPlayerStatus.Idle, 30000);

    connection.destroy();
  },
};
