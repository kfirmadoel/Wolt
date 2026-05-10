#ifndef USERSDATA_H
#define USERSDATA_H

#include "UserData.h"
#include <map>

class UsersData
{
public:
    /*
    This function adds userData to the map of users*/
    void addUserData(const UserData &user);
    /*
    Returns true if user exists, false otherwise*/
    bool userExists(int userId) const;

    /* Returns pointer to user data if user exists, nullptr otherwise
     */
    const UserData *getUserPtr(int userId) const;
    UserData *getUserPtr(int userId);

    /*This function returns a map of all users
     */
    const std::map<int, UserData> &getAllUsers() const;

private:
    /*
    This id a map of all users*/
    std::map<int, UserData> data;
};

#endif
