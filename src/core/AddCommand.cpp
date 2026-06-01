#include "AddCommand.h"
#include <sstream>

// Constructor implementation
AddCommand::AddCommand(UsersRepository& repo) : repository(repo) {}

// Execute the add command: parse args and update the local database
void AddCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string userId;
    
    // Extract User ID, return if invalid
    if (!(iss >> userId)) return;

    std::string productId;
    bool hasProducts = false;
    std::set<int> tempProducts;
    
    // Extract Product IDs and insert into the database
    while (iss >> productId) {
        repository.addProductToUser(userId, productId);
        hasProducts = true;
    }
    // Check for parsing errors that are not end-of-file
    if(iss.fail() && !iss.eof())
    hasProducts = false;
    //if not products were provided, ignore the command
    if(!hasProducts) return;
}