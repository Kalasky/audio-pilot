const User = require('../models/User')

// this function will encode the data object into a query string for the fetch request
const encodeFormData = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

const storeSpotifyAccessToken = async (userId, spotifyAccessToken) => {
  await User.findOneAndUpdate(userId, { spotifyAccessToken: spotifyAccessToken })
}

// this function will generate a new access token if the user's access token has expired
const generateAccessToken = async (userId, spotifyRefreshToken) => {
  const newToken = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
    },
    body: encodeFormData({
      grant_type: 'refresh_token',
      refresh_token: spotifyRefreshToken,
    }),
  })
    .then((res) => res.json())
    .then((data) => data.access_token)
  await storeSpotifyAccessToken(userId, newToken)
  return newToken
}

const spotifyHandler = async () => {
  const user = await User.findOne({ spotifyUsername: process.env.SPOTIFY_USERNAME })

  try {
    // Try making a request to the Spotify API with the current access token
    const response = await fetch(`https://api.spotify.com/v1/users/${process.env.SPOTIFY_USERNAME}`, {
      headers: {
        Authorization: `Bearer ${user.spotifyAccessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      console.log('Spotify access token is valid.')
    }

    // If the request fails with a "401 Unauthorized" error, generate a new access token
    if (response.status === 401) {
      console.log('Spotify access token has expired, generating new access token...')
      const newToken = await generateAccessToken(user.spotifyUsername, user.spotifyRefreshToken)
      if (newToken) {
        console.log('New access token generated successfully!')
      } else {
        console.error('Spotify refresh token FAILED. Visit http://localhost:7777/api/spotify/login to renew your tokens.')
      }
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = { spotifyHandler, encodeFormData }
