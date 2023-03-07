require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track from one of our supported platforms.")
    .addStringOption((option) =>
    option.setName('input').setDescription('Could be a link of the track, or a search term').setRequired(true)
  ),
  async execute(interaction) { 
    // code goes here
  },
};
