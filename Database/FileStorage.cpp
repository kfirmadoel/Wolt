#include "FileStorage.h"
#include <fstream>
#include <sstream>

FileStorage::FileStorage(const std::string &filename)
    : filename(filename) {}

void FileStorage::loadAllEvents(UsersData& data) {
    std::ifstream in(filename);
    if (!in)
        return;

    std::string line;

    while (std::getline(in, line)) {
        if (line.empty())
            continue;

        // Check if the line containes ':' mean its in a fix format
        if (line.find(':') != std::string::npos) {
            std::istringstream ss(line);
            int userId;
            char colon;
            ss >> userId >> colon;

            if (!data.isUserExists(userId)) {
                data.createUser(userId);
            }

            int productId;
            while (ss >> productId) {
                data.addProduct(userId, productId);
            }
        }
        else {
            //Check if the line contains 'ADD' means we need to read the specific format
            std::istringstream ss(line);
            int userId, productId;
            std::string op;

            ss >> userId >> op >> productId;

            if (op == "ADD") {
                if (!data.isUserExists(userId)) {
                    data.createUser(userId);
                }
                data.addProduct(userId, productId);
            }
        }
    }
}


void FileStorage::addProductWatched(int userId, int productId)
{
    std::ofstream out(filename, std::ios::app);
    out << userId << " ADD " << productId << "\n";
}

void FileStorage::rewriteFormat(const UsersData &data)
{

    std::ofstream out(filename);

    const auto &allUsers = data.getAllUsers();

    for (const auto &cell : allUsers)
    {
        int userId = cell.first;
        const UserData &user = cell.second;

        out << userId << ":";

        for (int product : user.getWatchedProducts())
        {
            out << " " << product;
        }

        out << "\n";
    }
}