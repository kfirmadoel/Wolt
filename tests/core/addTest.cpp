#include <gtest/gtest.h>
#include "AddCommand.h"
#include <map>
#include <set>
#include <string>

// Test adding a completely new user with multiple products
TEST(AddCommandTest, AddNewUserSuccess) {
    std::map<int, std::set<int>> mockDb;
    AddCommand addCmd(mockDb);

    addCmd.execute("101 1 2 3");
    
    // Verify user was created
    EXPECT_TRUE(mockDb.find(101) != mockDb.end());
    
    // Verify all products were added correctly
    EXPECT_EQ(mockDb[101].size(), 3);
    EXPECT_TRUE(mockDb[101].count(1));
    EXPECT_TRUE(mockDb[101].count(2));
    EXPECT_TRUE(mockDb[101].count(3));
}

// Test adding products sequentially to an already existing user
TEST(AddCommandTest, AddProductToExistingUser) {
    std::map<int, std::set<int>> mockDb;
    AddCommand addCmd(mockDb);

    // Initial addition
    addCmd.execute("102 10");
    
    // Subsequent addition to the same ID
    addCmd.execute("102 20"); 

    // Verify user exists and both products are present
    EXPECT_TRUE(mockDb.find(102) != mockDb.end());
    EXPECT_EQ(mockDb[102].size(), 2);
    EXPECT_TRUE(mockDb[102].count(10));
    EXPECT_TRUE(mockDb[102].count(20));
}

// Test validation for invalid inputs (e.g., negative IDs)
TEST(AddCommandTest, InvalidInputHandling) {
    std::map<int, std::set<int>> mockDb;
    AddCommand addCmd(mockDb);

    // Execute with a negative user ID
    addCmd.execute("-5 1 2");
    
    // Verify the invalid ID was ignored and not added to the map
    EXPECT_TRUE(mockDb.find(-5) == mockDb.end());
    // Only User ID provided, no products test.
    addCmd.execute("1");
    EXPECT_EQ(mockDb[1].size(), 0);
}
// Test validation for completely invalid string inputs (non-numeric IDs)
TEST(AddCommandTest, StringInputHandling) {
    std::map<int, std::set<int>> mockDb;
    AddCommand addCmd(mockDb);


    addCmd.execute("abc 1 2");
    
  
    EXPECT_TRUE(mockDb.empty());
}
// Test handling when a non-numeric string appears after several valid products
TEST(AddCommandTest, StringAsFourthProduct) {
    std::map<int, std::set<int>> mockDb;
    AddCommand addCmd(mockDb);

    addCmd.execute("200 10 20 30 abc");
    
    EXPECT_EQ(mockDb[200].count(10), 0);
    EXPECT_EQ(mockDb[200].count(20), 0);
    EXPECT_EQ(mockDb[200].count(30), 0);
}