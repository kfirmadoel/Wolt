#pragma once
#include "ICommand.h"
#include <map>
#include <set>
#include <string>

class AddCommand : public ICommand {
private:
    // Reference to the main database to reflect changes globally
    std::map<int, std::set<int>>& mabnat;

public:
    // Constructor injects the database reference
    AddCommand(std::map<int, std::set<int>>& db);
    
    // Executes the add logic using the provided arguments
    void execute(const std::string& args) override; 
};