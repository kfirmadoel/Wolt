#include "UserData.h"

UserData::UserData(int id) : userId(id) {}

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

void UserData::addProduct(int productId) {
    watchedProducts.insert(productId);
}

bool UserData::hasProductWatched(int productId) const noexcept {
    return watchedProducts.count(productId) > 0;
}
