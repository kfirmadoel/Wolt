#include <gtest/gtest.h>
#include "commands/GetCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>
#include <string>

class GetCommandTest : public ::testing::Test {
protected:
    FileStorage* storage;
    UsersRepository* mockDb;
    GetCommand* getCmd;

    void resetDb() {
        if (getCmd) delete getCmd;
        if (mockDb) delete mockDb;
        if (storage) delete storage;
        std::remove("test_get_db.txt");
        storage = new FileStorage("test_get_db.txt");
        mockDb = new UsersRepository(*storage);
        getCmd = new GetCommand(*mockDb);
    }

    void addData(const std::string& userId, std::initializer_list<std::string> products) {
        mockDb->createUser(userId);
        for (const std::string& p : products) {
            mockDb->addProductToUser(userId, p);
        }
    }

    void SetUp() override {
        storage = nullptr; mockDb = nullptr; getCmd = nullptr;
        resetDb();
        
        // Setup initial test data
        addData("1", {"100", "101", "102"});
        addData("2", {"101", "102", "104", "105"});
    }

    void TearDown() override {
        delete getCmd;
        delete mockDb;
        delete storage;
        std::remove("test_get_db.txt");
    }
};

// Verify successful recommendation returns 200 OK and the recommended items
TEST_F(GetCommandTest, SuccessfulRecommendationReturns200Ok) {
    std::string response = getCmd->execute("1 104");
    
    // We expect the command to return a 200 OK HTTP status
    EXPECT_NE(response.find("200 Ok"), std::string::npos);
    
    // We expect the recommended product from user 2 (105) to be in the response
    EXPECT_NE(response.find("105"), std::string::npos);
}

// Verify that requesting recommendations for a non-existent user returns an error
TEST_F(GetCommandTest, UserDoesNotExistReturnsError) {
    std::string response = getCmd->execute("999 104");
    
    // Expect an error status (e.g., 404), definitely not 200 OK
    EXPECT_EQ(response.find("200 Ok"), std::string::npos);
}