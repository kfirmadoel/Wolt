#include <gtest/gtest.h>
#include <sstream>
#include "core/App.h"
#include "commands/PostCommand.h"
#include "commands/PatchCommand.h"
#include "commands/DeleteCommand.h"
#include "commands/GetCommand.h"
#include "commands/HelpCommand.h"
#include "Database/FileStorage.h"
#include "Database/UsersRepository.h"
#include <cstdio>

class ProjectEndToEndTest : public ::testing::Test {
protected:
    const std::string dbFile = "test_project_end_to_end_db.txt";
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

TEST_F(ProjectEndToEndTest, FullCommandWorkflowProducesExpectedResults) {
    std::stringstream input;
    input << "post userA prod1 prod2\n";
    input << "post userB prod2 prod3\n";
    input << "get userA prod2\n";
    input << "patch userA prod4\n";
    input << "delete userA prod1\n";

    testing::internal::CaptureStdout();
    app->run(input);
    std::string output = testing::internal::GetCapturedStdout();

    EXPECT_NE(output.find("201 Created"), std::string::npos);
    EXPECT_NE(output.find("200 Ok"), std::string::npos);
    EXPECT_NE(output.find("prod3"), std::string::npos);
    EXPECT_NE(output.find("204 No Content"), std::string::npos);
    EXPECT_EQ(repository->isUserExists("userA"), true);
    EXPECT_TRUE(repository->getUser("userA").hasProductWatched("prod4"));
    EXPECT_FALSE(repository->getUser("userA").hasProductWatched("prod1"));
}
