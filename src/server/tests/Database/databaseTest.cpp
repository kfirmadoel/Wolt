#include <gtest/gtest.h>
#include <fstream>
#include <string>

// Include the target classes from the Database directory
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"

// Test Fixture to ensure a clean environment for each test case
class DatabaseTest : public ::testing::Test {
protected:
    const std::string testFileName = "test_wolt_db.txt";

    void SetUp() override {
        // Remove the test file before each test to prevent data contamination
        std::remove(testFileName.c_str());
    }

    void TearDown() override {
        // Clean up the test file after the test finishes
        std::remove(testFileName.c_str());
    }
};

// Test 1: Verifies that the physical database file is successfully created
TEST_F(DatabaseTest, FileStorageCreatesDatabaseFileAfterWrite) {
    // 1. Initialize storage
    FileStorage storage(testFileName);
    UsersRepository repo(storage);

    // 2. Perform an action that should trigger a file creation
    repo.createUser("99"); 
    
    // 3. Now check if the file was actually created on the disk
    std::ifstream file(testFileName);
    EXPECT_TRUE(file.good()) << "Error: File was not created even after a write operation!";
}

// Test 2: Validates Loose Coupling and Repository state management
TEST_F(DatabaseTest, RepositoryAddsUserAndProductSuccessfully) {
    // 1. Setup - Create storage and inject it into the repository (Dependency Injection)
    FileStorage storage(testFileName);
    UsersRepository repo(storage);

    std::string testUserId = "50";
    std::string testProductId = "1004";

    // 2. Action - Create a user and append a watched product
    repo.createUser(testUserId);
    repo.addProductToUser(testUserId, testProductId);

    // 3. Assert - Verify the state was correctly updated within the repository
    EXPECT_TRUE(repo.isUserExists(testUserId)) << "Repository failed to create user.";
    
    // Verify that querying a non-existent user behaves as expected
    EXPECT_FALSE(repo.isUserExists("999")) << "Repository falsely identified a non-existent user.";
    
}
// Test 3: Verifies that data actually persists after the storage object is destroyed
TEST_F(DatabaseTest, DataPersistsAfterRestart) {
    std::string persistentUserId = "88";

    //Create a repository, add a user, and destroy it
    {
        FileStorage storage(testFileName);
        UsersRepository repo(storage);
        repo.createUser(persistentUserId);
      
    }

    //Create a new repository instance pointing to the same file
    FileStorage newStorage(testFileName);
    UsersRepository newRepo(newStorage);

    //Check if the user created in Phase 1 still exists
    EXPECT_TRUE(newRepo.isUserExists(persistentUserId)) 
        << "Error: Data was lost after the repository was restarted!";
}
TEST_F(DatabaseTest, HandlesMissingFileGracefully) {
    std::remove(testFileName.c_str());

    FileStorage storage(testFileName);
    UsersRepository repo(storage);

    EXPECT_FALSE(repo.isUserExists("999"));
}