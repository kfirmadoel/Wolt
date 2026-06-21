#ifndef USERSDATA_H
#define USERSDATA_H

#include "UserData.h"
#include <map>
#include <string>

/**
 * Represents all the users data
 */
class UsersData
{
public:
/**
 * Checks if a user exists
 * @param userId user id
 * @return true if the user exists
 */
    bool isUserExists(const std::string& userId) const;
    /**
     * Returns the user data for the given user id
     * @param userId user id
     * @return user data
     */
    const UserData& getUser(const std::string& userId) const;
    /**
     * Returns all the users data
     * @return all the users data as a map
     */
    const std::map<std::string, UserData>& getAllUsers() const;
    /**
     * Creates a new user
     * @param userId user id
     */
    void createUser(const std::string& userId);
    /**
     * Add a product to a user
     * @param userId user id
     * @param productId product id
     */
    void addProduct(const std::string& userId, const std::string& productId);

    /**
     * Removes a product from a user's watched list.
     * @param userId user id
     * @param productId product to remove
     */
    void removeProduct(const std::string& userId, const std::string& productId);
 

private:
    /**
     * All the users data
     */
    std::map<std::string, UserData> data;
};

#endif