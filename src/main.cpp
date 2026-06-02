#include <iostream>
#include <map>
#include <set>
#include <string>
#include "App.h"
#include "AddCommand.h"
#include "HelpCommand.h"
#include "RecommendCommand.h"
#include "FileStorage.h"
#include "UsersRepository.h"
#include "TcpServer.h"

using namespace std;

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


    AddCommand addCmd(repository);
    RecommendCommand recommendCmd(repository);
    HelpCommand helpCmd;

    // 3. Register commands in the system
    map<string, ICommand*> commands;
    commands["add"] = &addCmd;
    commands["recommend"] = &recommendCmd;
    commands["help"] = &helpCmd;

    // 4. Run the application
    App app(commands);
    std::cout << "Starting server on port " << port << "..." << std::endl;
    TcpServer server(port, app);
    server.run();

    return 0;
}