#include "App.h"
#include <sstream>

using namespace std;

App::App(map<string, ICommand*> injectedCommands) : commands(injectedCommands) {}

void App::run(istream& in) {
    string line;
    string commandName;
    string args;

    // Read input line by line until EOF
    while (getline(in, line)) {
        if (line.empty()) continue;

        istringstream iss(line);
        
        // Parse the command name (first word)
        if (!(iss >> commandName)) continue; 
        
        // Get the rest of the string as arguments
        getline(iss, args); 
        if (!args.empty() && args[0] == ' ') {
            args = args.substr(1); // Clean leading space
        }

        auto foundCommand = commands.find(commandName);
        if (foundCommand != commands.end()) {
            try {
                // Polymorphic call to execute
                foundCommand->second->execute(args);
            } catch (...) {
                // Silent catch per requirements
            }
        }
    }
}