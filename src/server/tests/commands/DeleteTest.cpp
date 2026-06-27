#include <gtest/gtest.h>
#include "commands/DeleteCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>
#include <string>

class DeleteCommandTest : public ::testing::Test {
protected:
    FileStorage* storage;
    UsersRepository* mockDb;
    DeleteCommand* deleteCmd;

    void SetUp() override {
        std::remove("test_delete_db.txt");
        storage = new FileStorage("test_delete_db.txt");
        mockDb = new UsersRepository(*storage);
        deleteCmd = new DeleteCommand(*mockDb);
    }

    void TearDown() override {
        delete deleteCmd;
        delete mockDb;
        delete storage;
        std::remove("test_delete_db.txt");
    }
};

// Verify that deleting a product from an existing user succeeds
TEST_F(DeleteCommandTest, DeleteProductsSuccess) {
    // First, pre-populate the user with some products
    mockDb->createUser("301");
    mockDb->addProductToUser("301", "10");
    mockDb->addProductToUser("301", "20");

    // Execute the DELETE command to remove product "10"
    std::string response = deleteCmd->execute("301 10");

    // Verify the response indicates success (contains "204 No Content")
    EXPECT_NE(response.find("204 No Content"), std::string::npos);

    // Verify that product "10" was actually removed from the database
    EXPECT_FALSE(mockDb->getUser("301").getWatchedProducts().count("10"));
    
    // Verify that product "20" is still there
    EXPECT_TRUE(mockDb->getUser("301").getWatchedProducts().count("20"));
}