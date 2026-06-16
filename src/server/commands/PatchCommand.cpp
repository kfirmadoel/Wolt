#include "PatchCommand.h"
#include <sstream>

PatchCommand::PatchCommand(UsersRepository& repo) : repository(repo) {}

std::string PatchCommand::execute(const std::string& args) {
    std::istringstream iss(args);
    std::string userId;

    if (!(iss >> userId)) return RES_400_BAD;

    // PATCH is only valid for existing users
    if (!repository.isUserExists(userId)) return RES_404_NOT;

    std::string productId;
    bool hasProducts = false;

    while (iss >> productId) {
        repository.addProductToUser(userId, productId);
        hasProducts = true;
    }

    if (!hasProducts) return RES_400_BAD;

    return "204 No Content\n";
}