const OpenAI = require('openai');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

module.exports = (authenticateSession) => {
  router.get('/upload', authenticateSession, (req, res) => {

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = openai.responses.create({
      model: "gpt-5-nano",
      input: "write a haiku about ai",
      store: true,
    });

    response.then((result) => res.json(result)).catch((err) => res.status(500).json({ error: err.message }));
  });
  return router;
};