import React, { createContext, useEffect, useReducer, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const CurrentUserContext = createContext(null);

//initial state for teacher
const userInitialState = {
  currentUser: null,
  status: "logged-out",
  error: null,
  userType: null,
  studentLibrary: null,
  studentTeacher: null,
};

//reducer for multiple cases
const reducer = (userState, action) => {
  switch (action.type) {
    case "LOGGED-OUT":
      return userInitialState;
    case "LOADING":
      return {
        ...userState,
        status: "loading",
      };
    case "TEACHER-DATA-RECEIVED":
      return {
        ...userState,
        currentUser: action.data,
        userType: "teacher",
        status: "idle",
      };
    case "STUDENT-DATA-RECEIVED":
      return {
        ...userState,
        currentUser: action.data,
        userType: "student",
        status: "idle",
        error: null,
      };
    case "SET-STUDENT-LIBRARY":
      return {
        ...userState,
        studentLibrary: action.library,
        status: "idle",
      };
    case "SET-STUDENT-TEACHER":
      return {
        ...userState,
        studentTeacher: action.teacher,
        status: "idle",
      };
    case "ERROR":
      return {
        ...userState,
        status: "error",
        error: action.error,
      };

    default:
      throw new Error(`Error, ${action.type} is not an action`);
  }
};

//component that holds the context for the current user. Works for teacher and students
const CurrentUserProvider = ({ children }) => {
  const { user } = useAuth0();
  const [userState, dispatch] = useReducer(reducer, userInitialState);

  //check to see if there is a student key in session storage. This is for keeping info on which student is checkd it.
  const [currentStudent, setCurrentStudent] = useState(() => {
    const persistParam = window.sessionStorage.getItem("Student");
    return persistParam !== null ? JSON.parse(persistParam) : null;
  });
  //check to see if user exists in teacher collection in db
  //if it does, get user
  //if it doesn't create user and set info

  ///////////////////////////////////////////////////////////////////////////////
  //  TEACHER FUNCTIONS                                                        //
  ///////////////////////////////////////////////////////////////////////////////

  //if the teacher is checked in, get teacher by email
  useEffect(() => {
    if (user) {
      setLoadingState();
      getTeacherByEmail();
    } else {
      setLoggedOutState();
    }
  }, [user]);

  //function that gets teacher from db by email
  const getTeacherByEmail = () => {
    fetch(`/teachers/${user.email}`)
      .then((res) => res.json())
      .then((teacherData) => {
        const { status, data } = teacherData;
        if (status === 201) {
          receiveTeacherDataFromServer(data);
        } else {
          createTeacherProfile(user.email, user.given_name, user.family_name);
        }
      })
      .catch((err) => {
        console.log("error:", err);
        receiveErrorFromServer();
        return;
      });
  };
  //function that creates a teacher document in teachers collection
  const createTeacherProfile = (email, givenName, surname) => {
    fetch(`/teachers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        givenName,
        surname,
        libraries: [],
        classrooms: [],
        categories: ["Std_categories_booknook"],
      }),
    })
      .then((res) => res.json())
      .then((teacherData) => {
        const { status, data } = teacherData;
        if (status === 201) {
          receiveTeacherDataFromServer(data);
        } else {
          createTeacherProfile(user.email, user.given_name, user.family_name);
        }
      })
      .catch((err) => {
        console.log("error:", err);
        receiveErrorFromServer();
        return;
      });
  };

  ///////////////////////////////////////////////////////////////////////////////
  //  STUDENT FUNCTIONS                                                        //
  ///////////////////////////////////////////////////////////////////////////////

  //if page is refreshed grab id from storage and get student info again.
  useEffect(() => {
    if (currentStudent) {
      setLoadingState();
      fetch(`/students/${currentStudent}`)
        .then((res) => res.json())
        .then((studentData) => {
          if (studentData.status === 200) {
            receiveStudentDataFromServer(studentData.data);
            getLibraryFromClassroom(studentData.data.classroomId);
          } else {
            receiveErrorFromServer(studentData.errorMsg);
            return;
          }
        })
        .catch((e) => {
          console.log("ERROR", e);
          return;
        });
    }
  }, []);

  //if currentStudent changes, set the new student id to session storage
  useEffect(() => {
    if (userState.userType === "student") {
      window.sessionStorage.setItem("Student", JSON.stringify(currentStudent));
    }
  }, [currentStudent]);

  //function that gets the classroom by id then sets the library with the info obtained
  const getLibraryFromClassroom = (classroomId) => {
    setLoadingState();

    fetch(`/classrooms/${classroomId}`)
      .then((res) => res.json())
      .then((classroomData) => {
        if (classroomData.status === 200) {
          setStudentLibrary(classroomData.data.library_id);

          getStudentTeacherByEmail(classroomData.data.teacherEmail);
        } else {
          receiveErrorFromServer(classroomData.errorMsg);
        }
      })
      .catch((err) => {
        console.log("error:", err);
        receiveErrorFromServer(
          "Something went wrong with getLibraryFromClassroom"
        );
        return;
      });
  };

  //gets the student's teacher information by the teacher's email.
  const getStudentTeacherByEmail = (teachEmail) => {
    fetch(`/teachers/${teachEmail}`)
      .then((res) => res.json())
      .then((teacherData) => {
        const { status, data, errorMsg } = teacherData;
        if (status === 201) {
          setStudentTeacher(data);
        } else {
          receiveErrorFromServer(errorMsg);
        }
      })
      .catch((err) => {
        console.log("error:", err);
        receiveErrorFromServer(
          "Something went wrong with getStudentTeacherByEmail"
        );
        return;
      });
  };

  //function to change status to LOGGED-OUT in dispatch
  const setLoggedOutState = () => {
    dispatch({ type: "LOGGED-OUT" });
  };

  //function to change status to LOADING in dispatch
  const setLoadingState = () => {
    dispatch({ type: "LOADING" });
  };

  //function to change type to TEACHER-DATA-RECEIVE in dispatch
  const receiveTeacherDataFromServer = (data) => {
    dispatch({ type: "TEACHER-DATA-RECEIVED", data });
  };

  //function to change type to STUDENT-DATA-RECEIVE in dispatch
  const receiveStudentDataFromServer = (data) => {
    dispatch({ type: "STUDENT-DATA-RECEIVED", data });
  };

  const setStudentLibrary = (library) => {
    dispatch({ type: "SET-STUDENT-LIBRARY", library });
  };

  const setStudentTeacher = (teacher) => {
    dispatch({ type: "SET-STUDENT-TEACHER", teacher });
  };

  //function to change status to ERROR in dispatch
  const receiveErrorFromServer = (error) => {
    dispatch({ type: "ERROR", error });
  };

  return (
    <CurrentUserContext.Provider
      value={{
        userState,
        currentStudent,
        setCurrentStudent,
        getTeacherByEmail,
        getLibraryFromClassroom,
        actions: {
          setLoggedOutState,
          setLoadingState,
          receiveTeacherDataFromServer,
          receiveStudentDataFromServer,
          setStudentLibrary,
          setStudentTeacher,
          receiveErrorFromServer,
        },
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export default CurrentUserProvider;
