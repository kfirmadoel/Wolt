#ifndef USERSREPOSITORY_H
#define USERSREPOSITORY_H

#include "UsersData.h"
#include "IDataStorage.h"
#include <string>
#include <map>

/**
 * Represents the users repository
 */
class UsersRepository {
public:
/**
 * Constructor for UsersRepository
 */
    explicit UsersRepository(IDataStorage& storage);
    
    /**
     * This method checks if a user exists
     * @param userId user id
     * @return true if the user exists, false otherwise
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
     * @return all the users data in a map structure
     */
    const std::map<std::string, UserData>& getAllUsers() const;

    /**
     * Adds a product to a user by user id
     * @param userId user id
     * @param productId product id
     */
    void addProductToUser(const std::string& userId, const std::string& productId);
    /**
     * Creates a new user
     * @param userId user id
     */
    void createUser(const std::string& userId);

private:
    /**
     * All the users data
     */
    UsersData users;
    /**
     * The data storage that represents the database
     */
    IDataStorage& storage;
};

#endif