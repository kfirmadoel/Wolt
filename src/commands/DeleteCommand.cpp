#include "DeleteCommand.h"
#include <sstream>
#include <vector>


DeleteCommand::DeleteCommand(UsersRepository& repo) : repository(repo) {}


std::string DeleteCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string userId;

    if (!(iss >> userId)) return RES_400_BAD;

    if (!repository.isUserExists(userId)) return RES_404_NOT;

    std::string productId;
    std::vector<std::string> products;

    while (iss >> productId) {
        products.push_back(productId);
    }

    if (products.empty()) return RES_400_BAD;

    // Validate all products exist before deleting any
    const UserData& user = repository.getUser(userId);
    for (const std::string& pid : products) {
        if (!user.hasProductWatched(pid)) return RES_404_NOT;
    }

    for (const std::string& pid : products) {
        repository.removeProductFromUser(userId, pid);
    }

    return "204 No Content\n";
}