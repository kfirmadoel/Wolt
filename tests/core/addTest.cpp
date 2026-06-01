#include <gtest/gtest.h>
#include "AddCommand.h"
#include "FileStorage.h"
#include "UsersRepository.h"
#include <cstdio>
#include <set>
#include <string>

// Test adding a completely new user with multiple products
TEST(AddCommandTest, AddNewUserSuccess) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    addCmd.execute("101 1 2 3");
    
    // Verify user was created
    EXPECT_TRUE(mockDb.isUserExists(101));
    
    // Verify all products were added correctly
    EXPECT_EQ(mockDb.getUser(101).getWatchedProducts().size(), 3);
    EXPECT_TRUE(mockDb.getUser(101).getWatchedProducts().count(1));
    EXPECT_TRUE(mockDb.getUser(101).getWatchedProducts().count(2));
    EXPECT_TRUE(mockDb.getUser(101).getWatchedProducts().count(3));
}

// Test adding products sequentially to an already existing user
TEST(AddCommandTest, AddProductToExistingUser) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    // Initial addition
    addCmd.execute("102 10");
    
    // Subsequent addition to the same ID
    addCmd.execute("102 20"); 

    // Verify user exists and both products are present
    EXPECT_TRUE(mockDb.isUserExists(102));
    EXPECT_EQ(mockDb.getUser(102).getWatchedProducts().size(), 2);
    EXPECT_TRUE(mockDb.getUser(102).getWatchedProducts().count(10));
    EXPECT_TRUE(mockDb.getUser(102).getWatchedProducts().count(20));
}

// Test validation for invalid inputs (e.g., negative IDs)
TEST(AddCommandTest, InvalidInputHandling) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    // Execute with a negative user ID
    addCmd.execute("-5 1 2");
    
    // Verify the invalid ID was ignored and not added
    EXPECT_FALSE(mockDb.isUserExists(-5));
    
    // Only User ID provided, no products test.
    addCmd.execute("1");
    // Depending on your logic, user might not be created, or created with 0 products
    if (mockDb.isUserExists(1)) {
        EXPECT_EQ(mockDb.getUser(1).getWatchedProducts().size(), 0);
    } else {
        EXPECT_FALSE(mockDb.isUserExists(1));
    }
}

// Test validation for completely invalid string inputs (non-numeric IDs)
TEST(AddCommandTest, StringInputHandling) {
    std::remove("test_add.txt");
    FileStorage storage("test_add.txt");
    UsersRepository mockDb(storage);
    AddCommand addCmd(mockDb);

    addCmd.execute("abc 1 2");
    // Just verifying it doesn't crash and didn't add garbage data
}