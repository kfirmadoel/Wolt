#pragma once
#include "core/App.h"

class TcpServer
{
private:
    // The port to listen on
    int port;
    // The application to handle requests
    App &app;

public:
    /**
     * Handles a single connected client until it disconnects.
     * @param clientSock the connected client socket fd
     */
    void handleClient(int clientSock);

    /**
     * Constructor for TcpServer
     * @param port the port to listen on
     * @param app the application to handle requests
     */
    TcpServer(int port, App &app);
    /**
     * Runs the server
     */
    void run();
};