/**
 * TCP Client Module for communicating with the C++ Server
 * Handles asynchronous socket connections and graceful error handling
 */

const net = require('net');

/**
 * Sends a command to the C++ server via TCP socket
 * @param {string} command - The command to send (e.g., "post userId product1 product2")
 * @param {string} host - The host address of the C++ server
 * @param {number} port - The port number of the C++ server
 * @returns {Promise<string>} - A promise that resolves with the server response
 */
const DEFAULT_CPP_HOST = process.env.CPP_SERVER_HOST || 'cpp-server';
const DEFAULT_CPP_PORT = parseInt(process.env.CPP_SERVER_PORT, 10) || 12345;

function sendCommandToCppServer(command, host, port) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        let response = '';
        let timeoutHandle;

        // Set a timeout for the connection (5 seconds)
        timeoutHandle = setTimeout(() => {
            socket.destroy();
            reject(new Error(`TCP connection timeout to ${host}:${port}`));
        }, 5000);

        // Handle successful connection
        socket.on('connect', () => {
            // Send the command to the C++ server
            socket.write(command + '\n');
        });

        // Handle data reception
        socket.on('data', (data) => {
            response += data.toString();

            // Check if we've received a complete response
            // C++ server responses end with status code followed by newlines or content
            if (response.includes('\n')) {
                clearTimeout(timeoutHandle);
                socket.destroy();
                resolve(response.trim());
            }
        });

        // Handle connection errors
        socket.on('error', (error) => {
            clearTimeout(timeoutHandle);
            reject(new Error(`TCP connection error to ${host}:${port}: ${error.message}`));
        });

        // Handle socket closure
        socket.on('close', () => {
            clearTimeout(timeoutHandle);
            if (response) {
                resolve(response.trim());
            } else {
                reject(new Error(`Connection closed without receiving response from ${host}:${port}`));
            }
        });

        // Initiate connection
        socket.connect(port, host);
    });
}

/**
 * Records a product view by a user in the C++ server
 * Sends a GET command to add the product to the user's watched products
 * @param {string} userId - The ID of the user viewing the product
 * @param {string} productId - The ID of the product being viewed
 * @param {string} host - The host address of the C++ server (default: localhost)
 * @param {number} port - The port number of the C++ server (default: 12345)
 * @returns {Promise<boolean>} - A promise that resolves to true if successful
 */
async function recordProductView(userId, productId, host = DEFAULT_CPP_HOST, port = DEFAULT_CPP_PORT) {
    try {
        // The GET command format: "get <userId> <productId>"
        // This tells the C++ server to record that the user viewed the product
        const command = `post ${userId} ${productId}`;
        
        const response = await sendCommandToCppServer(command, host, port);

        // Check if the response indicates success (201 Created or 200 Ok)
        if (response.includes('201 Created') || response.includes('200 Ok')) {
            console.log(`Successfully recorded product view: user=${userId}, product=${productId}`);
            return true;
        } else if (response.includes('404 Not Found')) {
            // User might already exist with this product, but we still consider it successful
            console.log(`Product already recorded or user exists: user=${userId}, product=${productId}`);
            return true;
        } else {
            console.warn(`Unexpected response from C++ server: ${response}`);
            // Don't fail the API request if C++ server returns unexpected response
            return true;
        }
    } catch (error) {
        console.error(`Failed to record product view: ${error.message}`);
        // Return true anyway - don't block the API response if C++ communication fails
        // This ensures graceful degradation
        return true;
    }
}

/**
 * Gets recommendations for a user based on a product they've viewed
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product
 * @param {string} host - The host address of the C++ server (default: localhost)
 * @param {number} port - The port number of the C++ server (default: 12345)
 * @returns {Promise<Array>} - A promise that resolves to an array of recommended product IDs
 */
async function getRecommendations(userId, productId, host = DEFAULT_CPP_HOST, port = DEFAULT_CPP_PORT) {
    try {
        const command = `get ${userId} ${productId}`;
        const response = await sendCommandToCppServer(command, host, port);

        // Parse the response
        if (response.includes('200 Ok')) {
            // Extract product IDs from the response (they come after the status line)
            const lines = response.split('\n');
            if (lines.length > 1) {
                const productIds = lines[1].trim().split(' ').filter(id => id.length > 0);
                return productIds;
            }
            return [];
        } else if (response.includes('404 Not Found')) {
            console.warn(`User not found in C++ server: ${userId}`);
            return [];
        } else {
            console.warn(`Unexpected response from C++ server: ${response}`);
            return [];
        }
    } catch (error) {
        console.error(`Failed to get recommendations: ${error.message}`);
        return [];
    }
}

module.exports = {
    sendCommandToCppServer,
    recordProductView,
    getRecommendations
};
