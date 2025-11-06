const OpenAI = require('openai');
const { z } = require('zod');
const { zodTextFormat } = require('openai/helpers/zod');
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

module.exports = (authenticateSession, upload) => {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const GroceryItem = z.object({
    name: z.string(),
    quantity: z.number(),
  });
  const Receipt = z.object({
    groceries: z.array(GroceryItem),
  });
  // POST route to handle image upload and text extraction
  router.post('/upload', authenticateSession, upload.single('image'), async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
      }

      // Additional validation
      if (req.file.size === 0) {
        return res.status(400).json({ error: 'Uploaded file is empty' });
      }

      // Convert image buffer to base64
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

      // Send image to OpenAI Vision API for text extraction
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all grocery items from this receipt image. For each item, return the name and quantity. If the name is a common abbreviated version of a grocery item, use the canonical name instead. Otherwise, return the unmodified name. If a quantity is explicitly shown (like '2x apples', '3 bananas', 'orange 1'), use that quantity. If no quantity is specified for an item, default to 1. Return the data as a structured list of grocery items with name and quantity fields."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ],
            text: {
              format: zodTextFormat(Receipt, 'grocery_receipt'),
            },
          }
        ],
        max_tokens: 1000
      });

      // Extract the text content from the response
      const extractedText = response.choices[0]?.message?.content || 'No text found in image';

      console.log('Text extraction successful');

      res.json({
        success: true,
        extractedText: extractedText,
        fileName: req.file.originalname,
        fileSize: req.file.size
      });

    } catch (error) {
      console.error('Upload processing error:', error);

      // Handle specific OpenAI API errors
      if (error.status === 401) {
        return res.status(500).json({
          error: 'API authentication failed',
          details: 'OpenAI API key is invalid or missing'
        });
      } else if (error.status === 429) {
        return res.status(503).json({
          error: 'Service temporarily unavailable',
          details: 'Rate limit exceeded. Please try again later.'
        });
      } else if (error.status === 400) {
        return res.status(400).json({
          error: 'Invalid image format',
          details: 'The image format is not supported by the vision API'
        });
      }

      res.status(500).json({
        error: 'Failed to process image',
        details: error.message
      });
    }
  });

  return router;
};