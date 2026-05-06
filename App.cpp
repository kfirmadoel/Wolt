#include "App.h"
#include <iostream>
#include <sstream>

using namespace std;

App::App(map<string, ICommand*> injectedCommands) : commands(injectedCommands) {}

void App::run() {
    string line;
    string commandName;
    string args;

    while (getline(cin, line)) {
        if (line.empty()) continue;

        istringstream iss(line);
        
        if (!(iss >> commandName)) continue; 
        
        getline(iss, args); 
        if (!args.empty() && args[0] == ' ') {
            args = args.substr(1);
        }
        auto foundCommand = commands.find(commandName);
        
        if (foundCommand != commands.end()) {
            try {
                foundCommand->second->execute(args);
            } catch (...) {
            }
        }
    }
}