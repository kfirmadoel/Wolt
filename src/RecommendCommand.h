#pragma once
#include "ICommand.h"
#include <map>
#include <set>
#include <string>
#include <vector>

class RecommendCommand : public ICommand {
private:
    std::map<int, std::set<int>>& database;

    // Helper to calculate similarity score between two users
    int getSimilarity(int user1, int user2);

public:
    // Constructor
    RecommendCommand(std::map<int, std::set<int>>& db);

    // Execute recommendation algorithm
    void execute(const std::string& args) override;
};