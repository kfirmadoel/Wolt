#include "AddCommand.h"
#include <sstream>

using namespace std;

AddCommand::AddCommand(map<int, set<int>>& db) : mabnat(db) {}

void AddCommand::execute(const string& args) {
    istringstream iss(args);
    int userId;
    int productId;

    // Extract userId first. Proceed only if successful.
    if (iss >> userId) {
        // Extract all productIds and insert them into the user's set.
        // std::set automatically handles duplicates.
        while (iss >> productId) {
            mabnat[userId].insert(productId);
        }
    }
}