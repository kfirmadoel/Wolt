#include "AddCommand.h"
#include <sstream>

// Constructor implementation
AddCommand::AddCommand(std::map<int, std::set<int>>& db) : database(db) {}

// Execute the add command: parse args and update the local database
void AddCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    int userId;
    
    // Extract User ID, return if invalid
    if (!(iss >> userId)) return;

    int productId;
    bool hasProducts = false;
    
    // Extract Product IDs and insert into the database
    while (iss >> productId) {
        database[userId].insert(productId);
        hasProducts = true;
    }

    // Ignore command if no products were provided 
    if (!hasProducts) return;

    // TODO: Call the external UPDATE_DATA module here
}