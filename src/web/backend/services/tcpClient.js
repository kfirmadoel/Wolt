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

function sendCommandToCppServer(command, host = DEFAULT_CPP_HOST, port = DEFAULT_CPP_PORT) {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        let response = '';
        let settled = false;
        const commandName = command.trim().split(/\s+/)[0].toLowerCase();

        const finish = (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutHandle);
            socket.destroy();
            if (error) reject(error);
            else resolve(response.replace(/\r\n/g, '\n').trim());
        };

        // Set a timeout for the connection (5 seconds)
        const timeoutHandle = setTimeout(() => {
            finish(new Error(`TCP connection timeout to ${host}:${port}`));
        }, 5000);

        socket.setEncoding('utf8');

        // Handle successful connection
        socket.on('connect', () => {
            // Send the command to the C++ server
            socket.write(command + '\n');
        });

        // Handle data reception
        socket.on('data', (data) => {
            response += data;
            const lines = response.replace(/\r\n/g, '\n').split('\n');
            if (lines.length < 2) return;

            // GET returns a status line, an empty line, then one line of IDs.
            if (lines[0] === '200 Ok') {
                if (lines.length < 4) return;
                if (lines[1] !== '') {
                    finish(new Error('Invalid recommendation response from C++ server'));
                    return;
                }
            } else if (commandName === 'help' && !/^\d{3} /.test(lines[0])) {
                if (lines[lines.length - 2] !== 'help' || lines[lines.length - 1] !== '') return;
            }
            finish();
        });

        // Handle connection errors
        socket.on('error', (error) => {
            finish(new Error(`TCP connection error to ${host}:${port}: ${error.message}`));
        });

        // Handle socket closure
        socket.on('close', () => {
            finish(new Error(`Connection closed before a complete response from ${host}:${port}`));
        });

        // Initiate connection
        socket.connect(port, host);
    });
}

/**
 * Records a product view by a user in the C++ server
 * Creates a new user with POST, or adds a view with PATCH for an existing user
 * @param {string} userId - The ID of the user viewing the product
 * @param {string} productId - The ID of the product being viewed
 * @param {string} host - The host address of the C++ server
 * @param {number} port - The port number of the C++ server (default: 12345)
 * @returns {Promise<boolean>} - A promise that resolves to true if successful
 */
async function recordProductView(userId, productId, host = DEFAULT_CPP_HOST, port = DEFAULT_CPP_PORT) {
    try {
        let response = await sendCommandToCppServer(`post ${userId} ${productId}`, host, port);
        let status = response.split('\n')[0];
        if (status === '201 Created') return true;
        if (status === '404 Not Found') {
            response = await sendCommandToCppServer(`patch ${userId} ${productId}`, host, port);
            status = response.split('\n')[0];
            if (status === '204 No Content') return true;
        }
        console.warn(`Could not record product view: ${status}`);
        return false;
    } catch (error) {
        console.error(`Failed to record product view: ${error.message}`);
        return false;
    }
}

/**
 * Gets recommendations for a user based on a product they've viewed
 * @param {string} userId - The ID of the user
 * @param {string} productId - The ID of the product
 * @param {string} host - The host address of the C++ server
 * @param {number} port - The port number of the C++ server (default: 12345)
 * @returns {Promise<Array>} - A promise that resolves to an array of recommended product IDs
 */
async function getRecommendations(userId, productId, host = DEFAULT_CPP_HOST, port = DEFAULT_CPP_PORT) {
    try {
        const command = `get ${userId} ${productId}`;
        const response = await sendCommandToCppServer(command, host, port);

        // Parse the response
        const status = response.split('\n')[0];
        if (status === '200 Ok') {
            const body = response.split('\n\n')[1] || '';
            return body.trim().split(/\s+/).filter(Boolean);
        } else if (status === '404 Not Found') {
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
