#include "TcpServer.h"
#include <iostream>
#include <sstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>

TcpServer::TcpServer(int port, App &app) : port(port), app(app) {}

void TcpServer::handleClient(int clientSock){
    char buffer[4096];
    //save in buffer
    std::string clientBuffer = "";

    while (true)
    {
        memset(buffer, 0, sizeof(buffer));
        int readBytes = recv(clientSock, buffer, sizeof(buffer) - 1, 0);

        if (readBytes == 0)
            break;
        if (readBytes < 0)
        {
            perror("error reading from client");
            break;
        }

        // 1. Append the newly read data to the accumulated buffer
        clientBuffer.append(buffer, readBytes);

        std::string fullResponse;
        size_t pos;

        // 2. As long as there is a newline character in the buffer, extract and process the full line
        while ((pos = clientBuffer.find('\n')) != std::string::npos)
        {
            // Extract the line (excluding the '\n' character)
            std::string line = clientBuffer.substr(0, pos);

            // Remove the processed line and the '\n' character from the buffer
            clientBuffer.erase(0, pos + 1);

            // Handle \r\n (Carriage Return + Line Feed) often sent by Windows/Telnet clients
            if (!line.empty() && line.back() == '\r')
            {
                line.pop_back();
            }

            // Pass the complete line to the application logic
            std::string response = app.handleLine(line);
            if (!response.empty())
            {
                fullResponse += response;
            }
        }

        // 3. Send back the collected responses (if any)
        if (!fullResponse.empty())
        {
            send(clientSock, fullResponse.c_str(), fullResponse.length(), 0);
        }
    }
}

void TcpServer::run()
{
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0)
    {
        perror("error creating socket");
        return;
    }

    // Allow port reuse to avoid "address already in use" on restart
    int opt = 1;
    setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(port);

    if (bind(sock, (struct sockaddr *)&sin, sizeof(sin)) < 0)
    {
        perror("error binding socket");
        close(sock);
        return;
    }

    if (listen(sock, 5) < 0)
    {
        perror("error listening to a socket");
        close(sock);
        return;
    }

    while (true)
    {
        struct sockaddr_in clientSin;
        unsigned int addrLen = sizeof(clientSin);

        int clientSock = accept(sock, (struct sockaddr *)&clientSin, &addrLen);
        if (clientSock < 0)
        {
            perror("error accepting client");
            continue;
        }

        handleClient(clientSock);
        close(clientSock);
    }

    close(sock);
}