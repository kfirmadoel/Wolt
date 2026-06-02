#include "TcpServer.h"
#include <iostream>
#include <sstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>

TcpServer::TcpServer(int port, App& app) : port(port), app(app) {}

void TcpServer::run() {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        perror("error creating socket");
        return;
    }

    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = INADDR_ANY;
    sin.sin_port = htons(port);

    if (bind(sock, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        perror("error binding socket");
        close(sock);
        return;
    }

    if (listen(sock, 5) < 0) {
        perror("error listening to a socket");
        close(sock);
        return;
    }

    while (true) {
        struct sockaddr_in client_sin;
        unsigned int addr_len = sizeof(client_sin);
        
        int client_sock = accept(sock, (struct sockaddr *) &client_sin, &addr_len);
        if (client_sock < 0) {
            perror("error accepting client");
            continue;
        }
        while(true){
        char buffer[4096];
        memset(buffer, 0, sizeof(buffer));
        
        int read_bytes = recv(client_sock, buffer, sizeof(buffer) - 1, 0);
        if(read_bytes == 0){
            break;
        }else if(read_bytes < 0){
            perror("error reading from client");
            break;
        }
            std::string request(buffer);
            std::istringstream input(request);
            
            std::stringstream responseStream;
            std::streambuf* oldCout = std::cout.rdbuf(responseStream.rdbuf());
            
            app.run(input);
            
            std::cout.rdbuf(oldCout);
            
            std::string response = responseStream.str();
            send(client_sock, response.c_str(), response.length(), 0);
        }
        close(client_sock);
    }
    
    close(sock);
}