#include <gtest/gtest.h>
#include "commands/HelpCommand.h"
#include <string>

class HelpCommandTest : public ::testing::Test {
protected:
    HelpCommand helpCmd;
};

// Verify that the help command outputs the updated Ex2 commands
TEST_F(HelpCommandTest, PrintsUpdatedHelpText) {
    std::string output = helpCmd.execute("");
    
    EXPECT_NE(output.find("POST"), std::string::npos);
    EXPECT_NE(output.find("GET"), std::string::npos);
    EXPECT_NE(output.find("PATCH"), std::string::npos);
    EXPECT_NE(output.find("DELETE"), std::string::npos);
    EXPECT_NE(output.find("help"), std::string::npos);
}

// Test execution with only whitespace (should be treated as empty and valid)
TEST_F(HelpCommandTest, HandlesWhitespaceArguments) {
    std::string output = helpCmd.execute("   \t  ");
    
    EXPECT_NE(output.find("POST"), std::string::npos);
    EXPECT_NE(output.find("help"), std::string::npos);
}

// Test execution with invalid arguments (assuming it returns an empty string or error)
TEST_F(HelpCommandTest, IgnoresInvalidArguments) {
    // "me" is an invalid argument for help
    std::string output = helpCmd.execute("me");
    
    // Check that it doesn't return the normal help text
    EXPECT_EQ(output.find("POST"), std::string::npos);
}