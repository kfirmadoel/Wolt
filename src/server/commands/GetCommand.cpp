#include "GetCommand.h"
#include <sstream>
#include <algorithm>
#include <vector>
#include <set>

GetCommand::GetCommand(UsersRepository& repo) : repository(repo) {}

int GetCommand::getSimilarity(const std::string& u1, const std::string& u2) {
    int commonCount = 0;
    const auto& products1 = repository.getUser(u1).getWatchedProducts();
    const auto& products2 = repository.getUser(u2).getWatchedProducts();

    auto it1 = products1.begin();
    auto it2 = products2.begin();

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

std::string GetCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string targetUser, targetProduct;
    char junk;

    if (!(iss >> targetUser >> targetProduct) || (iss >> junk)) {
        return RES_400_BAD;
    }

    if (!repository.isUserExists(targetUser)) {
        return RES_404_NOT;
    }

    // 1. Find users who watched targetProduct and calculate similarity weights
    std::map<std::string, int> userWeights;
    for (const auto& pair : repository.getAllUsers()) {
        const std::string& userId = pair.first;
        const std::set<std::string>& products = pair.second.getWatchedProducts();

        if (userId == targetUser) continue;
        if (products.count(targetProduct)) {
            userWeights[userId] = getSimilarity(targetUser, userId);
        }
    }

    // 2. Score other products based on weights of similar users
    std::map<std::string, int> productScores;
    const std::set<std::string>& seenByTarget = repository.getUser(targetUser).getWatchedProducts();

    for (const auto& pair : userWeights) {
        const std::string& userId = pair.first;
        int weight = pair.second;

        for (const std::string& pid : repository.getUser(userId).getWatchedProducts()) {
            if (pid != targetProduct && seenByTarget.find(pid) == seenByTarget.end()) {
                productScores[pid] += weight;
            }
        }
    }

    // 3. Sort: descending by score, then ascending by product ID
    std::vector<std::pair<std::string, int>> sorted(productScores.begin(), productScores.end());
    std::sort(sorted.begin(), sorted.end(),
        [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
            if (a.second != b.second) return a.second > b.second;
            return a.first < b.first;
        });

    // 4. Build response: RES_200_OK then up to 10 products space-separated
    std::string result = RES_200_OK;
    int count = 0;
    bool first = true;
    for (const auto& item : sorted) {
        if (count >= 10) break;
        if (!first) result += " ";
        result += item.first;
        first = false;
        count++;
    }
    result += "\n";

    return result;
}