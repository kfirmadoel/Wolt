#pragma once
#include <map>
#include <string>
#include <iostream>
#include "ICommand.h"
#include "../commands/Status.h"


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

    /**
     * Processes a single line of input and returns the response string.
     * Returns empty string if the line should be ignored.
     */
    std::string handleLine(const std::string& line);

    /**
     * Runs the app in console mode (reads from istream, prints to cout).
     * Used for testing / stdin mode.
     */
    void run(std::istream& in = std::cin);
};