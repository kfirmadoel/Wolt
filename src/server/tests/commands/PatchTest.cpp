#include <gtest/gtest.h>
#include "commands/PatchCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>
#include <string>

class PatchCommandTest : public ::testing::Test {
protected:
    FileStorage* storage;
    UsersRepository* mockDb;
    PatchCommand* patchCmd;

    void SetUp() override {
        std::remove("test_patch_db.txt");
        storage = new FileStorage("test_patch_db.txt");
        mockDb = new UsersRepository(*storage);
        patchCmd = new PatchCommand(*mockDb);
    }

    void TearDown() override {
        delete patchCmd;
        delete mockDb;
        delete storage;
        std::remove("test_patch_db.txt");
    }
};

// Verify that adding products to an existing user succeeds
TEST_F(PatchCommandTest, PatchExistingUserSuccess) {
    // First, pre-populate the user in the database
    mockDb->createUser("201");
    mockDb->addProductToUser("201", "10");

    // Execute the PATCH command to add more products
    std::string response = patchCmd->execute("201 20 30");

    // Verify the response indicates success (contains "204 No Content")
    EXPECT_NE(response.find("204 No Content"), std::string::npos);

    // Verify that the new products were actually appended to the database
    EXPECT_EQ(mockDb->getUser("201").getWatchedProducts().size(), 3);
    EXPECT_TRUE(mockDb->getUser("201").getWatchedProducts().count("10"));
    EXPECT_TRUE(mockDb->getUser("201").getWatchedProducts().count("20"));
    EXPECT_TRUE(mockDb->getUser("201").getWatchedProducts().count("30"));
}

// Verify that attempting to PATCH a non-existent user returns an error
TEST_F(PatchCommandTest, PatchNonExistentUserReturnsError) {
    // Try to patch a user that was never created
    std::string response = patchCmd->execute("999 40 50");

    // Verify that the response does NOT indicate success (should be an error status like 404)
    EXPECT_EQ(response.find("204 No Content"), std::string::npos);
}