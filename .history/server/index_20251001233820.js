// Library to allow us to create Websocket servers in Node.js
const WebSocket = require('ws')

// This creates a server that can handle WebSocket connections
// Port 9001 is where clients will connect to
const server = new WebSocket.Server({
    port: 9001,
    // Optional: You can add more configurations here
    // host: 'localhost' // Only accept connections from localhost
});

console.log(`WebSocket Server Started!`);
console.log(`Listening on port ${server.port}`);
console.log(`Open client.html in your browser to connect`);

// Keep track of all connected clients
// This array stores all active WebSocket connections
const connectedClients = [];

// When a new client connects to the server
server.on('connection', (clientSocket) => {
    console.log(`New Client connected!`);

    // Add this client to our list of connected clients
    connectedClients.push(clientSocket);
    console.log(`Total clients connected: ${connectedClients.length}`);
    
    // Send a welcome message to the newly connected client
    clientSocket.send(`Welcome to the WebSocket server! You are now connected.`);

    // When this specific client sends a message to the server
    clientSocket.on('message', (receivedMessage) => {
        // convert the message from Buffer to string
        const messageText = receivedMessage.toString();
        console.log(`Message from client: ${messageText}`);

        // Echo the message back to the same client
        clientSocket.send(`Server received: ${messageText}`);

        // Broadcast the message to all connected clients
        // This is useful for chat applications
        broadcastToAllClients(`Client says: ${messageText}`)
    });

    // When this client disconnects (closes the connection)
    clientSocket.on('close', () => {
        console.log(`Client disconnected`);

        // Remove this client from our list
        const clientIndex = connectedClients.indexOf(clientSocket);
        if(clientIndex > -1){
            connectedClients.splice(clientIndex, 1);
        }

        console.log(`Remaining clients: ${connectedClients.length}`);

        // Notify other Clients that someone left
        broadcastToAllClients(`Someone left the chat`);
    });

    // When there's an error with this client's connection
    clientSocket.on('error', (error) => {
        console.log(`WebSocket error: ${error}`);
    });
});

// HELPER FUNCTIONS

// Function to send a message to all connected clients
function broadcastToAllClients(message){
    console.log(`Broadcasting to ${connectedClients.length} clients: "${message}"`);

    // Loop through all connected clients
    connectedClients.forEach((client, index) => {
        // Check if the client connection is still open
        if(client.readyState === WebSocket.OPEN){
            // Send message to this client
            client.send(message);
            console.log(`Sent to client ${index + 1}`);
        }else{
            console.log(`Client ${index + 1} connection is closed`);
        }
    });
}

// Handle server-level errors
server.on('error', (error) => {
    console.log(`Server error:`, error);
});

// Handle when the server is closed
server.on('close', () => {
    console.log(`WebSocket server closed`);
});

// Handle Ctrl + C to gracefully shutdown the server
process.on('SIGINT', () =>{
    console.log(`\n Shutting down server...`);

    // Close all client connections
    connectedClients.forEach(client => {
        client.close();
    });

    // Close the server
    server.close(() => {
        console.log(`Server shutdown successfully`);
        ProcessingInstruction.exit(0);
    });
});