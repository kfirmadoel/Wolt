#include "UserData.h"

UserData::UserData(int id, const std::set<int>& products)
    : userId(id), watchedProducts(products) {}

int UserData::getUserId() const {
    return userId;
}

const std::set<int>& UserData::getWatchedProducts() const {
    return watchedProducts;
}

void UserData::addProducts(const std::set<int>& products) {
    watchedProducts.insert(products.begin(), products.end());
}
