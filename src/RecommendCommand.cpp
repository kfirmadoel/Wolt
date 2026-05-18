#include "RecommendCommand.h"
#include <sstream>
#include <iostream>
#include <algorithm>
#include <vector>

RecommendCommand::RecommendCommand(std::map<int, std::set<int>>& db) : database(db) {}

int RecommendCommand::getSimilarity(int u1, int u2) {
    int commonCount = 0;
    const auto& products1 = database.at(u1);
    const auto& products2 = database.at(u2);

    auto it1 = products1.begin();
    auto it2 = products2.begin();
    
    // Count common products using set iteration
    while (it1 != products1.end() && it2 != products2.end()) {
        if (*it1 < *it2) ++it1;
        else if (*it2 < *it1) ++it2;
        else {
            commonCount++;
            ++it1;
            ++it2;
        }
    }
    return commonCount;
}

void RecommendCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    int targetUser, targetProduct;

    // Validate input IDs
    if (!(iss >> targetUser >> targetProduct)) return;

    // 1. Find users who watched targetProduct and store their weights
    std::map<int, int> userWeights;
    for (auto const& pair : database) {
        int userId = pair.first;
        const std::set<int>& products = pair.second;

        if (userId == targetUser) continue;
        if (products.count(targetProduct)) {
            userWeights[userId] = getSimilarity(targetUser, userId);
        }
    }   
    
    // 2. Score other products based on weights of similar users
    std::map<int, int> productScores;
    const std::set<int>& seenByTarget = database.at(targetUser);

    for (auto const& pair : userWeights) {
        int userId = pair.first;
        int weight = pair.second;

        for (int pid : database.at(userId)) {
            // Exclude already seen products and the target product itself
            if (pid != targetProduct && seenByTarget.find(pid) == seenByTarget.end()) {
                productScores[pid] += weight;
            }
        }
    }

    // 3. Sort products by score (descending) then by ID (ascending)
    std::vector<std::pair<int, int>> sorted(productScores.begin(), productScores.end());
    
    std::sort(sorted.begin(), sorted.end(), [](const std::pair<int, int>& a, const std::pair<int, int>& b) {
        if (a.second != b.second) return a.second > b.second; 
        return a.first < b.first; 
    });

    // 4. Print top 10 recommended products
    int count = 0;
    bool first = true;
    for (const auto& item : sorted) {
        if (count >= 10) break;
        if (!first) std::cout << " ";
        std::cout << item.first;
        first = false;
        count++;
    }
    std::cout << std::endl; 
}