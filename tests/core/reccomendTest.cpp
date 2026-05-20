#include <gtest/gtest.h>
#include "../src/RecommendCommand.h"
#include <map>
#include <set>
#include <string>
#include <algorithm>

class RecommendCommandTest : public ::testing::Test {
protected:
    std::map<int, std::set<int>> mockDb;

    void SetUp() override {
        // Initialize the database exactly as specified in the assignment appendix
        mockDb[1]  = {100, 101, 102, 103};
        mockDb[2]  = {101, 102, 104, 105, 106};
        mockDb[3]  = {100, 104, 105, 107, 108};
        mockDb[4]  = {101, 105, 106, 107, 109, 110};
        mockDb[5]  = {100, 102, 103, 105, 108, 111};
        mockDb[6]  = {100, 103, 104, 110, 111, 112, 113};
        mockDb[7]  = {102, 105, 106, 107, 108, 109, 110};
        mockDb[8]  = {101, 104, 105, 106, 109, 111, 114};
        mockDb[9]  = {100, 103, 105, 107, 112, 113, 115};
        mockDb[10] = {100, 102, 105, 106, 107, 109, 110, 116};
    }
};

// 1. Test case for the primary example from the assignment description
TEST_F(RecommendCommandTest, OfficialAssignmentExample) {
    RecommendCommand recCmd(mockDb);

    // Capture stdout to verify the printed recommendations
    testing::internal::CaptureStdout();
    
    recCmd.execute("1 104");
    
    std::string output = testing::internal::GetCapturedStdout();
    
    // Expected output order based on the total relevance calculation
    std::string expectedOutput = "105 106 111 110 112 113 107 108 109 114\n";
    EXPECT_EQ(output, expectedOutput);
}

// 2. Test case to verify tie-breaking rules (ascending product ID when scores match)
TEST_F(RecommendCommandTest, TieBreakingRules) {
    mockDb.clear();
    mockDb[1] = {10}; 
    
    // Users 2 and 3 have the same similarity score with user 1
    mockDb[2] = {10, 99, 50, 20}; 
    mockDb[3] = {10, 99, 50, 20}; 

    RecommendCommand recCmd(mockDb);

    testing::internal::CaptureStdout();
    recCmd.execute("1 99"); 
    std::string output = testing::internal::GetCapturedStdout();

    // Products 20 and 50 have identical scores, so 20 must appear before 50
    // Target product 99 and already purchased product 10 must be excluded
    EXPECT_EQ(output, "20 50\n");
}

// 3. Test case to verify the cap of a maximum of 10 recommendation results
TEST_F(RecommendCommandTest, MaxTenRecommendationsLimit) {
    mockDb.clear();
    mockDb[1] = {1};
    
    // User 2 has purchased the target product and 15 additional potential recommendations
    mockDb[2] = {1, 100, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24};

    RecommendCommand recCmd(mockDb);

    testing::internal::CaptureStdout();
    recCmd.execute("1 100");
    std::string output = testing::internal::GetCapturedStdout();

    // Verify output count by counting the space separators (10 products = 9 spaces)
    int spaces = std::count(output.begin(), output.end(), ' ');
    EXPECT_EQ(spaces, 9);
}

// 4. Test case for validating malformed, empty, or negative inputs
TEST_F(RecommendCommandTest, InvalidInputHandling) {
    RecommendCommand recCmd(mockDb);

    // Empty arguments
    testing::internal::CaptureStdout();
    recCmd.execute("");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    // Missing target product ID
    testing::internal::CaptureStdout();
    recCmd.execute("1");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    // Non-numeric characters in the middle of the input
    testing::internal::CaptureStdout();
    recCmd.execute("1 abc 104");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    // Non-numeric characters at the end of the input
    testing::internal::CaptureStdout();
    recCmd.execute("1 104 abc");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");

    // Negative user ID validation
    testing::internal::CaptureStdout();
    recCmd.execute("-1 104");
    EXPECT_EQ(testing::internal::GetCapturedStdout(), "");
}