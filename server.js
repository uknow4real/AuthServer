require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-2'
});
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'sensors';

app.use(express.json())

app.post('/login', async(req, res) => {
  const id = req.body.id;
  const pwd = req.body.pwd;
  await dynamodb.get({
    TableName: dynamodbTableName,
    Key: {
      'sensorid': id
    }
  }).promise().then(response => {
    if (id == response.Item.sensorid && pwd == response.Item.pwd) {
      const sensor = { id: id, pwd: pwd };
      const accessToken = generateAccessToken(sensor);
      res.json({ accessToken: accessToken });
    } else {
      res.json({ msg: 'Authentication failed.' });
    }
  }, error => {
    console.error('Oh no.', error);
    res.status(500).send(error);
  })
})

function generateAccessToken(sensor) {
  return jwt.sign(sensor, process.env.ACCESS_TOKEN, { expiresIn: '30s' })
}

app.listen(process.env.port || 3000)