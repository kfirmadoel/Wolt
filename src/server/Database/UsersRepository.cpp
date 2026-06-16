#include "UsersRepository.h"

UsersRepository::UsersRepository(IDataStorage& storage)
    : storage(storage)
{
    storage.loadAllEvents(users);
    storage.rewriteFormat(users);
}

bool UsersRepository::isUserExists(const std::string& userId) const {
    return users.isUserExists(userId);
}

const UserData& UsersRepository::getUser(const std::string& userId) const {
    return users.getUser(userId);
}

const std::map<std::string, UserData>& UsersRepository::getAllUsers() const {
    return users.getAllUsers();
}

void UsersRepository::createUser(const std::string& userId) {
    if (!users.isUserExists(userId)) {
        users.createUser(userId);
        storage.rewriteFormat(users);
    }
}

void UsersRepository::addProductToUser(const std::string& userId, const std::string& productId) {
    if (!users.isUserExists(userId)) {
        users.createUser(userId);
    }

    users.addProduct(userId, productId);
    
    storage.addProductWatched(userId, productId);
}

 
void UsersRepository::removeProductFromUser(const std::string& userId, const std::string& productId) {
    users.removeProduct(userId, productId);
    storage.rewriteFormat(users);
}