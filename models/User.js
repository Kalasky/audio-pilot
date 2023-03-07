const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    spotifyUsername: String,
    spotifyAccessToken: String,
    spotifyRefreshToken: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', UserSchema)
