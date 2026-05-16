#include "App.h"
#include <sstream>

using namespace std;

App::App(map<string, ICommand*> injectedCommands) : commands(injectedCommands) {}

void App::run(istream& in) {
    string line;
    string commandName;
    string args;

    // Read input line by line until EOF [cite: 48, 55]
    while (getline(in, line)) {
        if (line.empty()) continue;

        // Global check: Ignore any line containing tabs 
        if (line.find('\t') != string::npos) continue;

        istringstream iss(line);
        
        // Parse the command name (first word)
        if (!(iss >> commandName)) continue; 
        
        // Handle case-insensitivity for command names
        for (char &c : commandName) {
            c = tolower(c);
        }

        // Get the rest of the string as arguments
        getline(iss, args); 
        if (!args.empty() && args[0] == ' ') {
            args = args.substr(1); // Clean leading space
        }

        auto foundCommand = commands.find(commandName);
        if (foundCommand != commands.end()) {
            try {
                // Polymorphic call to execute command logic
                foundCommand->second->execute(args);
            } catch (...) {
                // Silent catch to prevent printing errors [cite: 45, 47]
            }
        }
    }
}