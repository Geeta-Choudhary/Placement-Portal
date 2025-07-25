export const formatDate = (dateInput) => {
    let dateObj;

    // Check if the input is a number (Excel serial date)
    if (typeof dateInput === "number") {
        // Excel's base date is January 1, 1900
        const excelEpoch = new Date(1899, 11, 30); // Excel wrongly treats 1900 as a leap year
        dateObj = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
    } else {
        // Standard date string
        dateObj = new Date(dateInput);
    }

    if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
    }

    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "long" });
    const year = dateObj.getFullYear();

    // Add ordinal suffix to day
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${month} ${year}`;
};

export function convertToDashedDate(inputDate) {
    // Remove ordinal suffix from day
    const cleanDate = inputDate.replace(/(\d+)(st|nd|rd|th)/, '$1');

    // Parse the cleaned date string
    const dateObj = new Date(cleanDate);
    if (isNaN(dateObj.getTime())) {
        return "Invalid date";
    }

    // Format to DD-MM-YYYY
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return `${year}-${month}-${day}`;
}


export function setLoginUser(user) {
    if (!user) return null;
  
    const userData = {
      isAuthenticated: true,
      userRole: user.role,
      userName: user.name,
      id: user.id,
      rollNo: user.rollNo || user.email
    };
  
    // Store in localStorage
    Object.entries(userData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  
    return userData;
}
export function getLoginUser() {
  
    const userData = {
      isAuthenticated: localStorage.getItem("isAuthenticated"),
      userRole: localStorage.getItem("userName"),
      userName: localStorage.getItem("userName"),
      id: localStorage.getItem("id"),
      rollNo: localStorage.getItem("rollNo")
    };
    console.log(userData);
    return userData;
}
  
export function getRollNoOfLoginUser(){
   const role =  localStorage.getItem("role");
   console.log(localStorage.getItem("rollNo"));
   if(role !== "Admin"){
    return localStorage.getItem("rollNo");
   }
}