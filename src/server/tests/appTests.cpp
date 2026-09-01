#include <gtest/gtest.h>
#include <sstream>
#include "App.h"
#include "HelpCommand.h"

class HelpCommandAppTest : public ::testing::Test {
protected:
    std::map<std::string, ICommand*> commands;
    HelpCommand helpCmd;

    void SetUp() override {
        commands["help"] = &helpCmd;
    }
};

// Test that the system successfully handles mixed-case command inputs
TEST_F(HelpCommandAppTest, HandlesMixedCaseCommands) {
    std::stringstream input("heLP\n"); // Simulating mixed-case user input
    App app(commands);
    
    testing::internal::CaptureStdout();
    app.run(input);
    std::string output = testing::internal::GetCapturedStdout();
    
    EXPECT_NE(output.find("DELETE, arguments"), std::string::npos);
    EXPECT_NE(output.find("help"), std::string::npos);
}

// Test that the system cleans up trailing whitespaces and carriage returns
TEST_F(HelpCommandAppTest, HandlesCarriageReturnAndWhitespace) {
    std::stringstream input("help \r\n");
    App app(commands);
    
    testing::internal::CaptureStdout();
    app.run(input);
    std::string output = testing::internal::GetCapturedStdout();
    
    EXPECT_NE(output.find("DELETE, arguments"), std::string::npos);
    EXPECT_NE(output.find("help"), std::string::npos);
}