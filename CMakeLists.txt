cmake_minimum_required(VERSION 3.10)
project(WoltCoreProject)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# --- הבאת Google Test ---
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/heads/main.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# --- הגדרת נתיבי החיפוש ל-Headers (ה-IntelliSense קורא מפה) ---
include_directories(src src/common src/Database src/core tests .)

# --- 1. אוספים את כל קבצי ה-cpp שנמצאים תחת src ---
file(GLOB_RECURSE PROJECT_SOURCES "src/*.cpp")

# --- 2. מוציאים את main.cpp החוצה כדי שלא יתנגש בטסטים ---
list(REMOVE_ITEM PROJECT_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")

# --- 3. בניית האפליקציה: לוקחים את הקוד הנקי ומוסיפים לו את main.cpp בחזרה ---
add_executable(wolt_app ${PROJECT_SOURCES} "${CMAKE_CURRENT_SOURCE_DIR}/src/main.cpp")

# --- 4. בניית הטסטים: לוקחים את הקוד הנקי (בלי main) ואת קבצי הטסטים ---
file(GLOB_RECURSE ALL_TESTS "tests/*.cpp")
add_executable(wolt_tests ${PROJECT_SOURCES} ${ALL_TESTS})
target_link_libraries(wolt_tests GTest::gtest_main)