const assert = require('assert');
const net = require('net');
const tcpClient = require('../services/tcpClient');

describe('TCP Client Service', function() {
    this.timeout(10000);

    it('should reject on invalid host', async () => {
        try {
            await tcpClient.sendCommandToCppServer('post test prod1', '127.0.0.1', 65000);
            assert.fail('Expected promise to reject');
        } catch (error) {
            assert.ok(error.message.includes('TCP connection error') || error.message.includes('timeout'));
        }
    });

    it('should return a response on a mock server', async () => {
        const server = net.createServer((socket) => {
            socket.on('data', () => {
                socket.write('201 Created\n');
            });
        });

        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;

        const response = await tcpClient.sendCommandToCppServer('post test prod1', '127.0.0.1', port);
        assert.strictEqual(response, '201 Created');

        server.close();
    });
});
