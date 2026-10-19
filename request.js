const axios = require('axios');
const fs = require('fs');
const url = 'https://fortuwin.com/api/webapi/GetUserInfo/test?auth=7a4869dd46a988b5eaedbfe5f48d7ec1&rand=354546546';

// Log file setup
const logFile = './responses.log';
fs.writeFileSync(logFile, ''); // Clear the log file initially

// Function to hit endpoint and log response
async function hitEndpoint() {
  try {
    const response = await axios.get(url);
    fs.appendFileSync(logFile, JSON.stringify(response.data) + '\n');
  } catch (error) {
    console.error('Request failed:', error.message);
    fs.appendFileSync(logFile, `Error: ${error.message}\n`);
  }
}

// Run requests in a loop
(async () => {
  for (let i = 0; i < 10000; i++) {
    await hitEndpoint();
    console.log(`Request ${i + 1} completed`);
  }
})();
