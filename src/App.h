#pragma once
#include <map>
#include <string>
#include <iostream>
#include "ICommand.h"

class App {
private:
    std::map<std::string, ICommand*> commands;

public:
    App(std::map<std::string, ICommand*> injectedCommands);
    // Rule of 5: Block copying to avoid issues with internal pointers
    App(const App&) = delete;
    App& operator=(const App&) = delete;
    App(App&&) = delete;
    App& operator=(App&&) = delete;
    
    // Use istream to support both cin and file-based testing
    void run(std::istream& in = std::cin);
};