#pragma once
#include <map>
#include <string>
#include "ICommand.h"

class App {
private:
    std::map<std::string, ICommand*> commands;

public:
    App(std::map<std::string, ICommand*> injectedCommands);
    
    void run();
};