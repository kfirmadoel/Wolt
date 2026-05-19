#ifndef IDATASTORAGE_H
#define IDATASTORAGE_H

#include "UsersData.h"

/**
 * Represents the  interface for data storage
 */
class IDataStorage {
public:
    virtual ~IDataStorage() = default;

    /**
     * This method loads all the events from the storage
     */
    virtual void loadAllEvents(UsersData& data) = 0;

    /**
     * This method appends a new event to the storage
     */
    virtual void addProductWatched(int userId, int productId) = 0;


    /**
     * Rewrite the data file to be more readable
     * @param data all the users
     */
        virtual void rewriteFormat(const UsersData& data) = 0;
};

#endif
