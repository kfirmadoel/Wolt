#include "RecommendCommand.h"
#include <sstream>
#include <iostream>
#include <algorithm>
#include <vector>

RecommendCommand::RecommendCommand(UsersRepository& repo) : repository(repo) {}

int RecommendCommand::getSimilarity(const std::string& u1, const std::string& u2) {
    int commonCount = 0;
    const auto& products1 = repository.getUser(u1).getWatchedProducts();
    const auto& products2 = repository.getUser(u2).getWatchedProducts();

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
    std::string targetUser, targetProduct;

    char junk;
    // Validate input IDs and check for trailing garbage
    if (!(iss >> targetUser >> targetProduct) || (iss >> junk)) {
        return;
    }

    // Ensure the user actually exists in the database
    if (!repository.isUserExists(targetUser)) {
        return;
    }

    // 1. Find users who watched targetProduct and store their weights
    std::map<std::string, int> userWeights;
    for (auto const& pair : repository.getAllUsers()) {
        std::string userId = pair.first;
        const std::set<std::string>& products = pair.second.getWatchedProducts();

        if (userId == targetUser) continue;
        if (products.count(targetProduct)) {
            userWeights[userId] = getSimilarity(targetUser, userId);
        }
    }   
    
    // 2. Score other products based on weights of similar users
    std::map<std::string, int> productScores;
    const std::set<std::string>& seenByTarget = repository.getUser(targetUser).getWatchedProducts();

    for (auto const& pair : userWeights) {
        std::string userId = pair.first;
        int weight = pair.second;

        for (const std::string& pid : repository.getUser(userId).getWatchedProducts()) {
            // Exclude already seen products and the target product itself
            if (pid != targetProduct && seenByTarget.find(pid) == seenByTarget.end()) {
                productScores[pid] += weight;
            }
        }
    }

    // 3. Sort products by score (descending) then by ID (ascending)
    std::vector<std::pair<std::string, int>> sorted(productScores.begin(), productScores.end());
    
    std::sort(sorted.begin(), sorted.end(), [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
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