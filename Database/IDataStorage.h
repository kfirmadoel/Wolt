#ifndef IDATASTORAGE_H
#define IDATASTORAGE_H

#include "common/UsersData.h"   

class IDataStorage {
public:
/**
 * Destructor
 */
    virtual ~IDataStorage() = default;

    /* return a fully populated UsersData object with all the users data if it exists,
     * otherwise return an empty UsersData object    
    */
    virtual UsersData getAllData() = 0;

    /* Save the entire UsersData to the database
    */
    virtual void updateData(const UsersData& data) = 0;
};

#endif
