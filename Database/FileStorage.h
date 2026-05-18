#ifndef FILESTORAGE_H
#define FILESTORAGE_H

#include "IDataStorage.h"
#include <string>

/**
 * Represents the data storage that stores data in a file
 */
class FileStorage : public IDataStorage {
public:
    /**
     * Constructor for FileStorage
     */
    explicit FileStorage(const std::string& filename);
    /**
     * This method loads all the events from the storage
     * @param data The users data object representing all the users
     */
    void loadAllEvents(UsersData& data) override;
    /**
     * This method appends a new event to the storage
     * @param userId user id
     * @param productId product id
     */
    void addProductWatched(int userId, int productId) override;

    /***
     * Rewrite the file at more readable format
     * @param data the about all the users
     */
    void rewriteFormat(const UsersData& data);

private:
    /**
     * The file name for the data we store
     */
    std::string filename;
};

#endif
