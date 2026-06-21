#include <iostream>
#include <map>
#include <set>
#include <string>
#include "core/App.h"
#include "commands/PostCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"
#include "commands/GetCommand.h"
#include "commands/HelpCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include "Tcp/TcpServer.h"

using namespace std;

/**
 *  The main entry point of the application 
 */
int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <port_number>" << std::endl;
        return 1;
    }

    int port;
    try {
        port = std::stoi(argv[1]);
    } catch (const std::exception& e) {
        std::cerr << "Invalid port number provided." << std::endl;
        return 1;
    }

    // The central database structure we agreed upon
    FileStorage storage("data/users_db.txt");
    UsersRepository repository(storage);

    PostCommand   postCmd(repository);
    PatchCommand  patchCmd(repository);
    DeleteCommand deleteCmd(repository);
    GetCommand    getCmd(repository);
    HelpCommand   helpCmd;

    // 3. Register commands in the system
    map<string, ICommand*> commands;
    commands["post"]   = &postCmd;
    commands["patch"]  = &patchCmd;
    commands["delete"] = &deleteCmd;
    commands["get"]    = &getCmd;
    commands["help"]   = &helpCmd;

    // 4. Run the application
    App app(commands);
    std::cout << "Starting server on port " << port << "..." << std::endl;
    TcpServer server(port, app);
    server.run();

    return 0;
}