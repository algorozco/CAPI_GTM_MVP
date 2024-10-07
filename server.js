const express = require('express');
require('dotenv').config();
const axios = require('axios'); // For making HTTP requests to third-party services
const path = require('path');
const app = express();
const PORT = 8080; // Default GTM server container port
const GTM_CONTAINER_ID = 'GTM-NXHWNGDS'; // Your GTM container ID
const ENVIRONMENT = 'production';
const account_id=process.env.ACCOUNT_ID;
const authToken= process.env.CAPI_TOKEN;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// A basic route for receiving data from GTM client-side container
app.post('/collect', async (req, res) => {
  console.log("initiating POST handling")


  try {
    const eventData = req.body; // The event data sent by GTM client-side
    console.log('Received Event Data:', eventData);

    // Modify or process event data here if necessary before sending to third-party
    const processedData = processEventData(eventData);

    // Example: Forward the data to Google Analytics
    console.log('Sending to GA');
    await sendToGoogleAnalytics(processedData);

    // Example: Trigger a custom GTM tag on the server-side
    await triggerGTMTag(processedData);

    await triggerCAPIreq(null, authToken,account_id);

    res.status(200).send('Event data processed and sent to third-party services, including Reddit CAPI (direct)');
  } catch (error) {
    console.error('Error processing event data:', error);
    res.status(500).send('Server Error');
  }
});

app.post('/metrics/*', async (req, res) => {
  console.log("initiating metrics handling")
  try {
    const eventData = req.body; // The event data sent by GTM client-side
    console.log('Received Event Data:', eventData);

    // Modify or process event data here if necessary before sending to third-party
    const processedData = processEventData(eventData);

    // Example: Forward the data to Google Analytics
    console.log('Sending to GA');
    await sendToGoogleAnalytics(processedData);

    // Example: Trigger a custom GTM tag on the server-side
    await triggerGTMTag(processedData);

    res.status(200).send('Event data processed and sent to third-party services');
  } catch (error) {
    console.error('Error processing event data:', error);
    res.status(500).send('Server Error');
  }
});

// A GET route to handle requests for specific data or actions
app.get('/data', async (req, res) => {
  try {

    // Example: Get some data from a third-party service
    //const data = await fetchFromThirdPartyService();

    //res.status(200).json(data);

    res.sendFile(path.join(__dirname, 'checkout_datalayer_ss.html'));

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Server Error');
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index_gtm_demo_mvp.html'));
});

/*app.get('/gtm/debug', (req, res) => {
    res.send("GTM Debug mode is active");
});*/

// Function to process event data (if needed)
function processEventData(data) {
  // Modify or enhance the data here if necessary (e.g., adding extra metadata)
  return {
    ...data,
    serverProcessedTimestamp: Date.now(), // Example: adding a timestamp
  };
}

// Function to send the event data to Google Analytics (or another third-party service)
async function sendToGoogleAnalytics(data) {
  /*
  const gaEndpoint = 'https://www.google-analytics.com/collect'; // Google Analytics endpoint

  // Send a POST request to Google Analytics
  const response = await axios.post(gaEndpoint, data);
  console.log('GA Response:', response.data);
  */
  console.log('Pretend I sent something to GA. Received: ',data)

}

// Function to trigger a custom GTM tag on the server-side
async function triggerGTMTag(data) {
  console.log("triggering GTM tag someday. Received: ",data);


  /*
  const gtmEndpoint = 'https://www.googletagmanager.com/gtag/js?id=GTM-NXHWNGDS'; // Your GTM Container ID
  const tagId = 'YOUR_CUSTOM_TAG_ID'; // Your custom GTM tag ID

  // Send a POST request to the GTM endpoint with the necessary data
  const response = await axios.post(gtmEndpoint, {
    event: 'PageVisit', // Example event name
    event_data: data, // Event data to pass to the tag
    tag: tagId, // Your custom tag ID
  });
  console.log('GTM Response:', response.data);
  */

}

async function triggerCAPIreq(data, authToken,account_id) {
  console.log("triggering CAPI request. Received: ", data);

  const endpoint = 'https://ads-api.reddit.com/api/v2.0/conversions/events/'+account_id;
  const currentTimestamp = new Date().toISOString();
  const event_data = {
    "test_mode": false,
    "events": [
      {
        "event_at": currentTimestamp,
        "click_id": "testignore",
        "event_type": {
          "tracking_type": "Purchase"
        },
        "event_metadata": {
          "currency": "MXN",
          "conversion_id": "347324785734784378438734",
          "value": 88232474
        },
        "user": {
          "aaid": "efdda982-fe9d-44ad-9866-0794d394c918",
          "email": "ana.gonzalez@reddit",
          "ip_address": "3e579844a532c7add5ae7557d0c6abcc9b38ec7d7a80604871ddc3313207eba3",
          "uuid": "1726771278374.8c6cd2d3-25fd-4e86-a357-dbf7d6745d5c"
        }
      }
    ]
  };

  // Send a POST request with the authorization header
  try {
    const response = await axios.post(endpoint, event_data, {
      headers: {
        'Authorization': `Bearer ${authToken}` // Or the appropriate format for your auth token
      }
    });
    console.log('CAPI Response:', response.data);
    return response.data; // Return the response data for further processing
  } catch (error) {
    console.error('Error in CAPI request:', error.response ? error.response.data : error);
    //Handle error appropriately, maybe throw or return an error object
    return null; //Or throw error;
  }
}

// Function to fetch data from a third-party service (example)
async function fetchFromThirdPartyService() {
  //const endpoint = 'https://ads-api.reddit.com/api/v2.0/conversions/events/t2_bn7v9r2q'; // Example third-party endpoint
  console.log("executing fetchFromThirdPartyService")
  // Send a GET request to the third-party service
  // const response = await axios.get(endpoint);
  //return response.data;
  return;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});