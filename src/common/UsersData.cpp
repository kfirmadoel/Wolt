#include "UsersData.h"
#include <stdexcept>

bool UsersData::isUserExists(int userId) const {
    return data.find(userId) != data.end();
}

const UserData& UsersData::getUser(int userId) const {
    return data.at(userId);
}

const std::map<int, UserData>& UsersData::getAllUsers() const {
    return data;
}

void UsersData::createUser(int userId) {
    data.emplace(userId, UserData(userId));
}

void UsersData::addProduct(int userId, int productId) {
    data[userId].addProduct(productId);
}