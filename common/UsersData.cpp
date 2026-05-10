#include "UsersData.h"

void UsersData::addUserData(const UserData &user)
{
    data[user.getUserId()] = user;
}

bool UsersData::userExists(int userId) const
{
    return data.find(userId) != data.end();
}

const UserData *UsersData::getUserPtr(int userId) const
{
    auto it = data.find(userId);
    if (it != data.end())
        return &it->second;
    return nullptr;
}

/**
 * Returns pointer to user data if user exists, nullptr otherwise
 */
UserData *UsersData::getUserPtr(int userId)
{
    auto it = data.find(userId);
    if (it != data.end())
        return &it->second;
    return nullptr;
}

/**
 *  Returns a map of all users
 */
const std::map<int, UserData> &UsersData::getAllUsers() const
{
    return data;
}
