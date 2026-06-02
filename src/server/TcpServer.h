#ifndef TCPSERVER_H
#define TCPSERVER_H

#include "App.h"

class TcpServer {
private:
    int port;
    App& app;

public:
    TcpServer(int port, App& app);
    void run();
};

#endif