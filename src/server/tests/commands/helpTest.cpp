#include <gtest/gtest.h>
#include "commands/HelpCommand.h"
#include <string>

class HelpCommandTest : public ::testing::Test {
protected:
    HelpCommand helpCmd;
};

// Test normal execution with no arguments
TEST_F(HelpCommandTest, PrintsCorrectHelpText) {
    testing::internal::CaptureStdout();
    
    helpCmd.execute("");
    
    std::string output = testing::internal::GetCapturedStdout();
    std::string expectedOutput = 
        "add [userid] [productid1] [productid2] ...\n"
        "recommend [userid] [productid]\n"
        "help\n";
        
    EXPECT_EQ(output, expectedOutput);
}

// Test execution with only whitespace (should be treated as empty and valid)
TEST_F(HelpCommandTest, HandlesWhitespaceArguments) {
    testing::internal::CaptureStdout();
    
    helpCmd.execute("   \t  ");
    
    std::string output = testing::internal::GetCapturedStdout();
    std::string expectedOutput = 
        "add [userid] [productid1] [productid2] ...\n"
        "recommend [userid] [productid]\n"
        "help\n";
        
    EXPECT_EQ(output, expectedOutput);
}

// Test execution with invalid arguments (should print nothing at all)
TEST_F(HelpCommandTest, IgnoresInvalidArguments) {
    testing::internal::CaptureStdout();
     // "help me" is invalid
    helpCmd.execute("me");
    
    std::string output = testing::internal::GetCapturedStdout();
    
    EXPECT_EQ(output, "");
}