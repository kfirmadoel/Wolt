#include "AddCommand.h"
#include <sstream>

// Constructor implementation
AddCommand::AddCommand(std::map<int, std::set<int>>& db) : database(db) {}

// Execute the add command: parse args and update the local database
void AddCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    int userId;
    
    // Extract User ID, return if invalid
    if (!(iss >> userId)||userId <= 0) return;

    int productId;
    bool hasProducts = false;
    std::set<int> tempProducts;
    
    // Extract Product IDs and insert into the database
    while (iss >> productId) {
        if (productId <= 0) return; 
        tempProducts.insert(productId);
        hasProducts = true;
    }
    // Check for parsing errors that are not end-of-file
    if(iss.fail() && !iss.eof())
    hasProducts = false;
    //if not products were provided, ignore the command
    if(!hasProducts) return;

    // Ignore command if no products were provided 
    if (!hasProducts) return;

    // Update the database: insert new user or add products to existing user
    database[userId].insert(tempProducts.begin(), tempProducts.end());
    
    // TODO: Call the external UPDATE_DATA module here
}