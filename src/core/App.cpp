#include "App.h"
#include <sstream>

using namespace std;

App::App(map<string, ICommand*> injectedCommands) : commands(injectedCommands) {}

void App::run(istream& in) {
    string line;

    // Read input line by line until EOF
    while (getline(in, line)) {
        // Fix Windows line endings (\r) artifact from Docker
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }

        if (line.empty()) continue;

        // Global check: Ignore any line containing tabs 
        if (line.find('\t') != string::npos) continue;

        istringstream iss(line);
        
        // MOVED INSIDE THE LOOP: Fresh and clean for every command
        string commandName;
        string args;
        
        // Parse the command name (first word)
        if (!(iss >> commandName)) continue; 
        
        // Handle case-insensitivity for command names
        for (char &c : commandName) {
            c = tolower(c);
        }

        // Get the rest of the string as arguments
        // Because 'args' is fresh, if this fails due to EOF, 'args' remains safely empty!
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
                // Silent catch to prevent printing errors
            }
        }
    }
}