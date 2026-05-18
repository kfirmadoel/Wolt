#pragma once
#include "ICommand.h"
#include <map>
#include <set>
#include <string>

class AddCommand : public ICommand {
private:
    // Reference to the main database
    std::map<int, std::set<int>>& database;

public:
    // Constructor
    AddCommand(std::map<int, std::set<int>>& db);

    // Execute the add command
    void execute(const std::string& args) override;
};