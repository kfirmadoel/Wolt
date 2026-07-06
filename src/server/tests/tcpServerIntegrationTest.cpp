#include <gtest/gtest.h>
#include <cstdio>
#include <sys/socket.h>
#include <unistd.h>
#include <thread>
#include <string>
#include "core/App.h"
#include "commands/PostCommand.h"
#include "commands/GetCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"
#include "commands/HelpCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include "Tcp/TcpServer.h"

class TcpServerIntegrationTest : public ::testing::Test {
protected:
    const std::string dbFile = "test_tcp_server_db.txt";
    FileStorage* storage = nullptr;
    UsersRepository* repository = nullptr;
    PostCommand* postCmd = nullptr;
    GetCommand* getCmd = nullptr;
    PatchCommand* patchCmd = nullptr;
    DeleteCommand* deleteCmd = nullptr;
    HelpCommand* helpCmd = nullptr;
    App* app = nullptr;
    TcpServer* tcpServer = nullptr;
    int serverFd = -1;
    int clientFd = -1;

    void SetUp() override {
        std::remove(dbFile.c_str());
        storage = new FileStorage(dbFile);
        repository = new UsersRepository(*storage);
        postCmd = new PostCommand(*repository);
        getCmd = new GetCommand(*repository);
        patchCmd = new PatchCommand(*repository);
        deleteCmd = new DeleteCommand(*repository);
        helpCmd = new HelpCommand();

        std::map<std::string, ICommand*> commands;
        commands["post"] = postCmd;
        commands["get"] = getCmd;
        commands["patch"] = patchCmd;
        commands["delete"] = deleteCmd;
        commands["help"] = helpCmd;

        app = new App(commands);
        tcpServer = new TcpServer(0, *app);

        int fds[2];
        ASSERT_EQ(socketpair(AF_UNIX, SOCK_STREAM, 0, fds), 0);
        serverFd = fds[0];
        clientFd = fds[1];
    }

    void TearDown() override {
        if (clientFd >= 0) close(clientFd);
        if (serverFd >= 0) close(serverFd);
        delete tcpServer;
        delete app;
        delete helpCmd;
        delete deleteCmd;
        delete patchCmd;
        delete getCmd;
        delete postCmd;
        delete repository;
        delete storage;
        std::remove(dbFile.c_str());
    }
};

TEST_F(TcpServerIntegrationTest, HandleClientProcessesCommandsOverSocket) {
    std::thread serverThread([this]() {
        tcpServer->handleClient(serverFd);
    });

    const std::string request = "post user1 prod2\npost user2 prod2 prod3\nget user1 prod2\n";
    ssize_t written = write(clientFd, request.c_str(), request.size());
    ASSERT_EQ(written, static_cast<ssize_t>(request.size()));
    shutdown(clientFd, SHUT_WR);

    std::string response;
    char buffer[256];
    ssize_t received;
    while ((received = read(clientFd, buffer, sizeof(buffer))) > 0) {
        response.append(buffer, received);
    }

    serverThread.join();

    EXPECT_NE(response.find("201 Created\n"), std::string::npos);
    EXPECT_NE(response.find("200 Ok"), std::string::npos);
    EXPECT_NE(response.find("prod3"), std::string::npos);
}
