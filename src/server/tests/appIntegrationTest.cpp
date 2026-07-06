#include <gtest/gtest.h>
#include <cstdio>
#include <map>
#include <string>
#include "core/App.h"
#include "commands/PostCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"
#include "commands/GetCommand.h"
#include "commands/HelpCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"

class AppIntegrationTest : public ::testing::Test {
protected:
    const std::string dbFile = "test_app_integration_db.txt";
    FileStorage* storage = nullptr;
    UsersRepository* repository = nullptr;
    PostCommand* postCmd = nullptr;
    PatchCommand* patchCmd = nullptr;
    DeleteCommand* deleteCmd = nullptr;
    GetCommand* getCmd = nullptr;
    HelpCommand* helpCmd = nullptr;
    App* app = nullptr;

    void SetUp() override {
        std::remove(dbFile.c_str());
        storage = new FileStorage(dbFile);
        repository = new UsersRepository(*storage);
        postCmd = new PostCommand(*repository);
        patchCmd = new PatchCommand(*repository);
        deleteCmd = new DeleteCommand(*repository);
        getCmd = new GetCommand(*repository);
        helpCmd = new HelpCommand();

        std::map<std::string, ICommand*> commands;
        commands["post"] = postCmd;
        commands["patch"] = patchCmd;
        commands["delete"] = deleteCmd;
        commands["get"] = getCmd;
        commands["help"] = helpCmd;

        app = new App(commands);
    }

    void TearDown() override {
        delete app;
        delete helpCmd;
        delete getCmd;
        delete deleteCmd;
        delete patchCmd;
        delete postCmd;
        delete repository;
        delete storage;
        std::remove(dbFile.c_str());
    }
};

TEST_F(AppIntegrationTest, FullCommandFlowIntegration) {
    EXPECT_EQ(app->handleLine("post user1 prod2"), "201 Created\n");
    EXPECT_TRUE(repository->isUserExists("user1"));

    EXPECT_EQ(app->handleLine("post user2 prod2 prod3"), "201 Created\n");
    EXPECT_TRUE(repository->isUserExists("user2"));

    std::string result = app->handleLine("get user1 prod2");
    EXPECT_NE(result.find("200 Ok"), std::string::npos);
    EXPECT_NE(result.find("prod3"), std::string::npos);

    EXPECT_EQ(app->handleLine("patch user1 prod4"), "204 No Content\n");
    EXPECT_TRUE(repository->getUser("user1").hasProductWatched("prod4"));

    EXPECT_EQ(app->handleLine("delete user1 prod2"), "204 No Content\n");
    EXPECT_FALSE(repository->getUser("user1").hasProductWatched("prod2"));
}
