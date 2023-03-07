require('dotenv').config()
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
  data: new SlashCommandBuilder().setName('register').setDescription('Play a track from one of our supported platforms.'),
  async execute(interaction) {
    await interaction.reply({
      content: `Visit http://localhost:7777/api/spotify/login to link your Spotify account.`,
      ephemeral: true,
    })
  },
}
