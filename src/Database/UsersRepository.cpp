#include "UsersRepository.h"

UsersRepository::UsersRepository(IDataStorage& storage)
    : storage(storage)
{
    storage.loadAllEvents(users);
    storage.rewriteFormat(users);
}

bool UsersRepository::isUserExists(int userId) const {
    return users.isUserExists(userId);
}

const UserData& UsersRepository::getUser(int userId) const {
    return users.getUser(userId);
}

const std::map<int, UserData>& UsersRepository::getAllUsers() const {
    return users.getAllUsers();
}

void UsersRepository::createUser(int userId) {
    if (!users.isUserExists(userId)) {
        users.createUser(userId);
        storage.rewriteFormat(users);
    }
}

void UsersRepository::addProductToUser(int userId, int productId) {
    if (!users.isUserExists(userId)) {
        users.createUser(userId);
    }

    users.addProduct(userId, productId);
    
    storage.addProductWatched(userId, productId);
}
