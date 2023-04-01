const express = require('express');
const app = express();
http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const {Configuration, OpenAIApi} = require("openai");
require("dotenv").config();

const { Server } = require('socket.io');
const io = new Server(server);

var count_num = 0;
//Prompt engineering data
const {SystemContent, usercontent1, assistantcontent1, usercontent2, assistcontent2, CUSTOM_STRING} = process.env;

app.use(cors());
app.use(express.json());
app.use('/', express.static(__dirname + '/frontend')); // Serves resources from client folder
app.post('/get-prompt-result', async (req, res) => {
    // Get the prompt from the request body
    const {prompt, apiKey} = req.body;
    let OPENAI_API_KEY;
    //set openAI configuration
    if(apiKey == CUSTOM_STRING){
         OPENAI_API_KEY  = process.env.OPENAI_API_KEY;
    } else {
        OPENAI_API_KEY = apiKey;
    }

    const configuration = new Configuration({
        apiKey: OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);
    // Check if prompt is present in the request
    if (!prompt) {
        // Send a 400 status code and a message indicating that the prompt is missing
        return res.status(400).send({error: 'Prompt is missing in the request'});
    }

    try {
        const completion = await openai.createChatCompletion({
            model:  "gpt-3.5-turbo", // model name
            messages: [
                {"role":"system", "content":SystemContent},
                {"role":"user", "content": usercontent1},
                {"role":"assistant", "content":assistantcontent1},
                {"role":"user", "content":usercontent2},
                {"role":"assistant", "content":assistcontent2},
                {"role":"user", "content": `using the concepts written previously rewrite this article with a high degree of high academic level, perplexity and burstiness:${prompt}`}
            ],
        });

        // Send the generated text as the response
        return res.send(completion.data.choices[0].message.content);
    } catch (error) {
        const errorMsg = error.response ? error.response.data.error : `${error}`;
        console.error(errorMsg);
        // Send a 500 status code and the error message as the response
        return res.status(500).send(errorMsg);
    }
});

//alert user connected
io.on('connection', (socket) => {
    count_num = socket.client.conn.server.clientsCount;
    console.log( socket.client.conn.server.clientsCount + " users connected" );
    io.emit('connectedUserCount', count_num);
})

const port = process.env.PORT || 3001;

server.listen(port, () => console.log(`Listening on port ${port}`));
