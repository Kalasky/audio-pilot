const searchSong = async (query) => {
  await refreshMiddleware()
  const user = await User.findOne({ spotifyUsername: process.env.SPOTIFY_USERNAME })
  try {
    const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${user.spotifyAccessToken}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await res.json()

    // if no song is found, return an error message
    if (!data.tracks.items[0]) {
      twitchClient.say(process.env.TWITCH_USERNAME, 'No song found from Spotify. Please try again.')
      return
    }

    const trackId = data.tracks.items[0].uri
    return trackId
  } catch (error) {
    console.log(error)
  }
}
