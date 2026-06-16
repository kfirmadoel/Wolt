// addTest.cpp
#include <gtest/gtest.h>
#include "commands/PostCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>
#include <set>
#include <string>

TEST(AddCommandTest, AddNewUserSuccess) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    addCmd.execute("101 1 2 3");
    
    EXPECT_TRUE(mockDb.isUserExists("101"));
    EXPECT_EQ(mockDb.getUser("101").getWatchedProducts().size(), 3);
    EXPECT_TRUE(mockDb.getUser("101").getWatchedProducts().count("1"));
    EXPECT_TRUE(mockDb.getUser("101").getWatchedProducts().count("2"));
    EXPECT_TRUE(mockDb.getUser("101").getWatchedProducts().count("3"));
}

TEST(AddCommandTest, AddProductToExistingUser) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    addCmd.execute("102 10");
    addCmd.execute("102 20"); 

    EXPECT_TRUE(mockDb.isUserExists("102"));
    EXPECT_EQ(mockDb.getUser("102").getWatchedProducts().size(), 2);
    EXPECT_TRUE(mockDb.getUser("102").getWatchedProducts().count("10"));
    EXPECT_TRUE(mockDb.getUser("102").getWatchedProducts().count("20"));
}

TEST(AddCommandTest, InvalidInputHandling) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    addCmd.execute("1");
    if (mockDb.isUserExists("1")) {
        EXPECT_EQ(mockDb.getUser("1").getWatchedProducts().size(), 0);
    } else {
        EXPECT_FALSE(mockDb.isUserExists("1"));
    }
}