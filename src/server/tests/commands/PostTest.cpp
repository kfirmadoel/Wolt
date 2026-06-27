#include <gtest/gtest.h>
#include "commands/PostCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>
#include <string>

class PostCommandTest : public ::testing::Test {
protected:
    FileStorage* storage;
    UsersRepository* mockDb;
    PostCommand* postCmd;

    void SetUp() override {
        std::remove("test_post_db.txt");
        storage = new FileStorage("test_post_db.txt");
        mockDb = new UsersRepository(*storage);
        postCmd = new PostCommand(*mockDb);
    }

    void TearDown() override {
        delete postCmd;
        delete mockDb;
        delete storage;
        std::remove("test_post_db.txt");
    }
};

// Verify that a new user is created successfully and 201 Created is returned
TEST_F(PostCommandTest, AddNewUserSuccessReturns201) {
    std::string response = postCmd->execute("101 1 2 3");
    
    // Check the HTTP status response
    EXPECT_EQ(response, "201 Created\n");
    
    // Verify that the data was actually saved in the database
    EXPECT_TRUE(mockDb->isUserExists("101"));
    EXPECT_EQ(mockDb->getUser("101").getWatchedProducts().size(), 3);
    EXPECT_TRUE(mockDb->getUser("101").getWatchedProducts().count("1"));
    EXPECT_TRUE(mockDb->getUser("101").getWatchedProducts().count("2"));
    EXPECT_TRUE(mockDb->getUser("101").getWatchedProducts().count("3"));
}

// In ex2, POST fails if the user already exists - an error should be returned
TEST_F(PostCommandTest, UserAlreadyExistsReturnsError) {
    postCmd->execute("102 10"); // Initial creation (Success)
    
    std::string response = postCmd->execute("102 20"); // Attempt to create the same user again
    
    // Verify that the response is not 201 
    EXPECT_NE(response, "201 Created\n");
    
    // Verify that the new product was not added to the existing user via POST
    EXPECT_FALSE(mockDb->getUser("102").getWatchedProducts().count("20"));
}