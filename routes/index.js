const url = require('url');
const express = require('express');
const router = express.Router();
const needle = require('needle');
const apicache = require('apicache');

// Env vars
const API_BASE_URL = process.env.API_BASE_URL; // e.g., 'https://pulse.centrakey.com/api'
const API_KEY_NAME = process.env.API_KEY_NAME; // e.g., 'token'
const API_KEY_VALUE = process.env.API_KEY_VALUE; // Your actual API key

// Init cache (optional)
let cache = apicache.middleware;

// Dynamic route handling
router.get('/*', cache('2 minutes'), async (req, res, next) => {
  try {
    // Extract the route part (e.g., /get_streams_data or /get_downloads_data)
    const path = req.path.substring(1); // Remove leading '/' from path

    // Construct the full URL for the accounting API
    const targetUrl = `${API_BASE_URL}/${path}`;

    // Capture query parameters from the incoming request
    const incomingParams = url.parse(req.url, true).query;

    // Add the API token to the query parameters
    const params = new URLSearchParams({
      [API_KEY_NAME]: API_KEY_VALUE,
      ...incomingParams, // Include the query parameters from the original request
    });

    // Send the request to the accounting API
    const apiRes = await needle('get', `${targetUrl}?${params.toString()}`);
    const data = apiRes.body;

    // Log the request (optional)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`REQUEST: ${targetUrl}?${params.toString()}`);
    }

    // Send the response back to the client
    res.status(200).json(data);
  } catch (error) {
    // Handle errors (e.g., API request failure)
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from the accounting API' });
  }
});

module.exports = router;
