#include "PostCommand.h"
#include <sstream>

PostCommand::PostCommand(UsersRepository& repo) : repository(repo) {}

std::string PostCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string userId;

    if (!(iss >> userId)) return RES_400_BAD;

    // POST is only valid for new users
    if (repository.isUserExists(userId)) return RES_404_NOT;

    std::string productId;
    bool hasProducts = false;

    while (iss >> productId) {
        repository.addProductToUser(userId, productId);
        hasProducts = true;
    }

    if (!hasProducts) return RES_400_BAD;

    return RES_201_CREATED;
}