#include "UsersData.h"
#include <stdexcept>

bool UsersData::isUserExists(const std::string& userId) const {
    return data.find(userId) != data.end();
}

const UserData& UsersData::getUser(const std::string& userId) const {
    return data.at(userId);
}

const std::map<std::string, UserData>& UsersData::getAllUsers() const {
    return data;
}

void UsersData::createUser(const std::string& userId) {
    data.emplace(userId, UserData(userId));
}

void UsersData::addProduct(const std::string& userId, const std::string& productId) {
    data[userId].addProduct(productId);
}

void UsersData::removeProduct(const std::string& userId, const std::string& productId) {
    data[userId].removeProduct(productId);
}