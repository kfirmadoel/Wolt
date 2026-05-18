#ifndef USERSDATA_H
#define USERSDATA_H

#include "UserData.h"
#include <map>

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
    bool isUserExists(int userId) const;
    /**
     * Returns the user data for the given user id
     * @param userId user id
     * @return user data
     */
    const UserData& getUser(int userId) const;
    /**
     * Returns all the users data
     * @return all the users data as a map
     */
    const std::map<int, UserData>& getAllUsers() const;
    /**
     * Creates a new user
     * @param userId user id
     */
    void createUser(int userId);
    /**
     * Add a product to a user
     * @param userId user id
     * @param productId product id
     */
    void addProduct(int userId, int productId);

private:
    /**
     * All the users data
     */
    std::map<int, UserData> data;
};

#endif
