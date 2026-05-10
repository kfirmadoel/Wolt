#ifndef USERDATA_H
#define USERDATA_H

#include <set>

class UserData
{
public:
    /**
     * Default constructor
     */
    UserData() = default;
    /**
     * Constructor with parameters(user id and set of watched products)
     */
    UserData(int id, const std::set<int> &products);
    /**
     * Returns user id
     */
    int getUserId() const;
    /**
     * Returns set of watched products of user
     */
    const std::set<int> &getWatchedProducts() const;
    /**
     * Adds products to watched products
     */
    void addProducts(const std::set<int> &products);

private:
    /**
     *   User id
     * */
    int userId = -1;
    /**
     * Set of watched products for this user
     */
    std::set<int> watchedProducts;
};

#endif
