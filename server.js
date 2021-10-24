require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

const login = {
  id: "807d3ab75e78",
  pwd: "uknow4real",
};

let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  if (req.body.id == login.id && req.body.pwd == login.pwd) {
    const id = req.body.id;
    const pwd = req.body.pwd;
    const sensor = { id: id, pwd: pwd };

    const accessToken = generateAccessToken(sensor);
    const refreshToken = jwt.sign(sensor, process.env.REFRESH_TOKEN);
    refreshTokens.push(refreshToken);
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } else {
    res.json({ msg: 'Not valid credentials' });
  }
})

function generateAccessToken(sensor) {
  return jwt.sign(sensor, process.env.ACCESS_TOKEN, { expiresIn: '15s' })
}

app.listen(process.env.port || 3000)