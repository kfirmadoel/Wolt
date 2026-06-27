#include <gtest/gtest.h>
#include <sstream>
#include "App.h"
#include "HelpCommand.h"

class AppIntegrationTest : public ::testing::Test {
protected:
    std::map<std::string, ICommand*> commands;
    HelpCommand helpCmd;

    void SetUp() override {
        // Registering the help command in lowercase, exactly as done in main.cpp
        commands["help"] = &helpCmd;
    }
};

// Test that the system successfully handles mixed-case command inputs
TEST_F(AppIntegrationTest, HandlesMixedCaseCommands) {
    std::stringstream input("heLP\n"); // Simulating mixed-case user input
    App app(commands);
    
    testing::internal::CaptureStdout();
    app.run(input);
    std::string output = testing::internal::GetCapturedStdout();
    
    // Verifying that the help text was printed successfully despite the mixed casing
    EXPECT_NE(output.find("add [userid]"), std::string::npos);
}

// Test that the system cleans up trailing whitespaces and carriage returns
TEST_F(AppIntegrationTest, HandlesCarriageReturnAndWhitespace) {
    std::stringstream input("help \r\n");
    App app(commands);
    
    testing::internal::CaptureStdout();
    app.run(input);
    std::string output = testing::internal::GetCapturedStdout();
    
    EXPECT_NE(output.find("add [userid]"), std::string::npos);
}