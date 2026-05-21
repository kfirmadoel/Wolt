FROM gcc:latest

# התקנת CMake
RUN apt-get update && apt-get install -y cmake

# העתקת הפרויקט לתוך הקונטיינר
COPY . /usr/src/wolt_project
WORKDIR /usr/src/wolt_project

# מוודאים שתיקיית data קיימת בתוך הקונטיינר (למקרה שה-gitkeep לא עבר)
RUN mkdir -p data

# יצירת תיקיית build, הרצת cmake וקימפול
RUN mkdir build
WORKDIR /usr/src/wolt_project/build
RUN cmake .. && make

# חזרה לתיקייה הראשית כדי שהתוכנית תרוץ מול תיקיית data הנכונה
WORKDIR /usr/src/wolt_project

# ברירת מחדל: הרצת האפליקציה הראשית
CMD ["./build/wolt_app"]