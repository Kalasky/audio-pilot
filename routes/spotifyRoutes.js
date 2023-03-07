const express = require('express')
const router = express.Router()
const qs = require('qs')
const User = require('../models/User')
const spotifyUtils = require('../middleware/tokenHandler')

// this route will accept get requests at /api/login and redirect to the spotify login page
router.get('/spotify/login', async (req, res) => {
  const scope = `user-modify-playback-state
      user-read-playback-state 
      user-read-playback-position
      user-read-currently-playing
      user-read-recently-played
      user-read-private
      user-library-modify
      user-library-read
      user-top-read
      user-follow-read
      user-follow-modify
      playlist-read-private
      playlist-modify-public
      playlist-modify-private
      playlist-read-collaborative`
  // redirect to spotify login page with the client id, redirect uri, and scope as query parameters
  res.redirect(
    307,
    'https://accounts.spotify.com/authorize?' +
      qs.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      })
  )
})

let accessToken
let refreshToken

router.get('/spotify/callback', async (req, res) => {
  const code = req.query.code
  const body = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    client_id: process.env.SPOTIFY_CLIENT_ID,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET,
  }

  const tokenReponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: spotifyUtils.encodeFormData(body), // encode the data object into a query string
  })
  const tokenData = await tokenReponse.json()
  // extract access token and refresh token from response
  accessToken = tokenData.access_token
  refreshToken = tokenData.refresh_token

  const userReponse = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const userData = await userReponse.json()
  console.log(userData)

  // check if user is in the database
  const user = await User.findOne({ spotifyUsername: userData.id })

  // if user is in the database and update their spotify id and followers
  if (user) {
    console.log('user is in the database')
    User.findOneAndUpdate(
      { spotifyUsername: userData.id },
      { spotifyAccessToken: accessToken, spotifyRefreshToken: refreshToken },
      { new: true } // return updated doc
    )
    res.redirect('http://localhost:7777')
  } else {
    // if user is not in the database, create a new user
    const newUser = new User({
      spotifyUsername: userData.id,
      spotifyAccessToken: accessToken,
      spotifyRefreshToken: refreshToken,
    })
    await newUser.save()

    res.redirect(307, 'http://localhost:7777')
  }
})

module.exports = router
