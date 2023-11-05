import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ViewTimetable from "./viewtt";
import getEnvironment from "../getenvironment";
import "./Timetable.css";
import TimetableSummary from "./ttsummary";
import ReactToPrint from "react-to-print";
import { Container } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/react";
import {
  CustomTh,
  CustomLink,
  CustomBlueButton,
  CustomPlusButton,
  CustomDeleteButton,
} from "../styles/customStyles";
import { Box, Text, Portal, ChakraProvider } from "@chakra-ui/react";

import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/table";
import { Button } from "@chakra-ui/button";

const Timetable = () => {
  const [timetableData, setTimetableData] = useState({});
  const [viewData, setViewData] = useState({});
  const [viewFacultyData, setViewFacultyData] = useState({});
  const [viewRoomData, setViewRoomData] = useState({});
  const [message, setMessage] = useState();
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableSems, setAvailableSems] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableFaculties, setAvailableFaculties] = useState([]);

  const [lockedTime, setLockedTime] = useState();
  const [savedTime, setSavedTime] = useState();

  const [facultyUpdateTime, setFacultyUpdateTime] = useState();
  const [roomUpdateTime, setRoomUpdateTime] = useState();
  // const availableRooms = ['L-201', 'L-209','room1','room2'];
  // const availableFaculties = ['Dr. Vinod Ashokan','Dr. Harleen Dahiya','Dr. Abhinav Pratap Singh','Professor Arvinder Singh',
  // 'Dr. Praveen Malik','Dr. Rohit Mehra','Dr. Arvind Kumar','Dr. Kiran Singh','Dr. H. M. Mittal','Dr. Suneel Dutt', 'f1','f2',];
  const semesters = availableSems;
  const [viewselectedSemester, setViewSelectedSemester] = useState(
    availableSems[0]
  );
  const [viewFaculty, setViewFaculty] = useState(availableFaculties[0]);
  const [viewRoom, setViewRoom] = useState(availableRooms[0]);

  const [selectedSemester, setSelectedSemester] = useState("");
  const selectedCell = null;
  const navigate = useNavigate();
  const currentURL = window.location.pathname;
  const parts = currentURL.split("/");
  const currentCode = parts[parts.length - 1];
  // console.log('Code:', code);
  const apiUrl = getEnvironment();

  useEffect(() => {
    const fetchSem = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/addsem?code=${currentCode}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          // console.log('filtered data',data)
          const filteredSems = data.filter((sem) => sem.code === currentCode);
          const semValues = filteredSems.map((sem) => sem.sem);

          setAvailableSems(semValues);
          setSelectedSemester(semValues[0]);
          // console.log('available semesters',availableSems)
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };
    fetchSem();
  }, [apiUrl, currentCode]);

  useEffect(() => {
    const fetchData = async (semester) => {
      try {
        // console.log('sem value',semester);
        // console.log('current code', currentCode);
        const response = await fetch(
          `${apiUrl}/timetablemodule/tt/viewclasstt/${currentCode}/${semester}`,
          { credentials: "include" }
        );
        const data = await response.json();
        // console.log(data);
        const initialData = generateInitialTimetableData(data, "sem");
        return initialData;
      } catch (error) {
        console.error("Error fetching existing timetable data:", error);
        return {};
      }
    };

    const fetchTime = async () => {
      try {
        // console.log('sem value',semester);
        // console.log('current code', currentCode);
        const response = await fetch(
          `${apiUrl}/timetablemodule/lock/viewsem/${currentCode}`,
          { credentials: "include" }
        );
        const data = await response.json();
        setLockedTime(data.updatedTime.lockTimeIST);
        setSavedTime(data.updatedTime.saveTimeIST);
      } catch (error) {
        console.error("Error fetching existing timetable data:", error);
      }
    };

    const fetchTimetableData = async (semester) => {
      const data = await fetchData(semester);
      setTimetableData(data);
    };

    fetchTimetableData(selectedSemester);
    fetchTime();
  }, [selectedSemester, apiUrl, currentCode]);

  useEffect(() => {
    const fetchData = async (semester) => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/tt/viewclasstt/${currentCode}/${semester}`,
          { credentials: "include" }
        );
        const data = await response.json();
        // console.log(data);
        const initialData = generateInitialTimetableData(data, "sem");
        return initialData;
      } catch (error) {
        console.error("Error fetching existing timetable data:", error);
        return {};
      }
    };

    const fetchViewData = async (semester) => {
      const data = await fetchData(semester);
      setViewData(data);
    };

    fetchViewData(viewselectedSemester);
  }, [selectedSemester, currentCode, apiUrl, viewselectedSemester]);

  useEffect(() => {
    const facultyData = async (currentCode, faculty) => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/tt/viewfacultytt/${currentCode}/${faculty}`,
          { credentials: "include" }
        );
        const data1 = await response.json();
        const data = data1.timetableData;
        setFacultyUpdateTime(data1.updatedTime);
        const initialData = generateInitialTimetableData(data, "faculty");
        return initialData;
      } catch (error) {
        console.error("Error fetching existing timetable data:", error);
        return {};
      }
    };
    const fetchFacultyData = async (faculty) => {
      const data = await facultyData(currentCode, faculty);
      setViewFacultyData(data);
    };
    fetchFacultyData(viewFaculty);
  }, [viewFaculty, currentCode, viewData]);

  useEffect(() => {
    const roomData = async (currentCode, room) => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/tt/viewroomtt/${currentCode}/${room}`,
          { credentials: "include" }
        );
        const data1 = await response.json();
        const data = data1.timetableData;
        setRoomUpdateTime(data1.updatedTime);
        const initialData = generateInitialTimetableData(data, "room");
        return initialData;
      } catch (error) {
        console.error("Error fetching existing timetable data:", error);
        return {};
      }
    };

    const fetchRoomData = async (room) => {
      const data = await roomData(currentCode, room);
      setViewRoomData(data);
    };

    fetchRoomData(viewRoom);
  }, [viewRoom, currentCode, viewData]);

  useEffect(() => {
    // Fetch subject data from the database and populate availableSubjects
    const fetchSubjects = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/subject/filteredsubject/${currentCode}/${selectedSemester}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableSubjects(data);
          // console.log('subjects', availableSubjects);
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    const fetchRoom = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/addroom?code=${currentCode}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          const filteredSems = data.filter((room) => room.code === currentCode);
          const semValues = filteredSems.map((room) => room.room);

          setAvailableRooms(semValues);
          // console.log('available rooms',availableRooms)
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    const fetchFaculty = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/timetablemodule/addfaculty/filteredfaculty/${currentCode}/${selectedSemester}`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          // console.log('faculty response',data[0]);
          setAvailableFaculties(data[0].faculty);
          // console.log('faculties', availableFaculties);
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    fetchSubjects();
    fetchRoom();
    fetchFaculty(); // Call the function to fetch subject data
  }, [selectedSemester, viewData, currentCode]);

  const generateInitialTimetableData = (fetchedData, type) => {
    const initialData = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    for (const day of days) {
      initialData[day] = {};
      for (const period of periods) {
        initialData[day][`period${period}`] = [];

        if (fetchedData[day] && fetchedData[day][`period${period}`]) {
          const slotData = fetchedData[day][`period${period}`];

          for (const slot of slotData) {
            const slotSubjects = [];
            let faculty = ""; // Declare faculty here
            let room = "";
            for (const slotItem of slot) {
              const subj = slotItem.subject || "";
              if (type == "room") {
                room = slotItem.sem || "";
              } else {
                room = slotItem.room || "";
              }
              if (type == "faculty") {
                faculty = slotItem.sem || "";
              } else {
                faculty = slotItem.faculty || "";
              }
              // Only push the values if they are not empty
              if (subj || room || faculty) {
                slotSubjects.push({
                  subject: subj,
                  room: room,
                  faculty: faculty,
                });
              }
            }

            // Push an empty array if no data is available for this slot
            if (slotSubjects.length === 0) {
              slotSubjects.push({
                subject: "",
                room: "",
                faculty: "",
              });
            }

            initialData[day][`period${period}`].push(slotSubjects);
          }
        } else {
          // Assign an empty array if day or period data is not available
          initialData[day][`period${period}`].push([]);
        }
      }
    }
    // console.log(initialData);
    return initialData;
  };

  useEffect(() => {
    // console.log('Updated timetableData:', timetableData);
  }, [timetableData]);

  const handleCellChange = (day, period, slotIndex, cellIndex, type, event) => {
    const newValue = event.target.value;

    // Create a copy of the current state to update
    const updatedData = { ...timetableData };

    // Ensure that the slot and cell exist before updating
    if (
      updatedData[day] &&
      updatedData[day][`period${period}`] &&
      updatedData[day][`period${period}`][slotIndex]
    ) {
      updatedData[day][`period${period}`][slotIndex][cellIndex][type] =
        newValue;

      saveSlotData(
        day,
        `period${period}`,
        updatedData[day][`period${period}`][slotIndex]
      );
    }

    // Update the state with the modified data
    setTimetableData(updatedData);
  };

  const handleSplitCell = (day, period, slotIndex) => {
    const newCell = {
      subject: "",
      room: "",
      faculty: "",
    };

    // Add the new cell to the specific slot within the day and period
    timetableData[day][`period${period}`][slotIndex].push(newCell);

    // Update the state
    setTimetableData({ ...timetableData });
  };

  const handleDeleteCell = (day, period, slotIndex, cellIndex) => {
    // Ensure that the slot and cell exist before updating
    if (timetableData[day] && timetableData[day][`period${period}`]) {
      const slot = timetableData[day][`period${period}`][slotIndex];

      // Check if there is more than one item in the slot
      if (slot.length > 0) {
        // Remove the last item from the slot
        slot.pop();
        // Update the state
        setTimetableData({ ...timetableData });
      }
    }
  };

  const location = useLocation();
  const currentPathname = location.pathname;
  const handleAddSubject = () => {
    // Navigate to the "Add Subject" page
    // const currentPathname = location.pathname;

    // Navigate to the current URL with an additional path segment
    navigate(`${currentPathname}/addsubjects`);
  };

  const handleAddFaculty = () => {
    // Navigate to the current URL with an additional path segment
    navigate(`${currentPathname}/addfaculty`);
  };

  const handleAddSem = () => {
    // Navigate to the current URL with an additional path segment
    navigate(`${currentPathname}/addsem`);
  };

  const handleAddRoom = () => {
    // Navigate to the "Add Room" page
    navigate(`${currentPathname}/addroom`);
  };
  const handleViewSummary = () => {
    // Navigate to the "Add Room" page
    navigate(`${currentPathname}/lockedsummary`);
  };

  const saveSlotData = async (day, slot, slotData) => {
    // Mark the function as async
    const Url = `${apiUrl}/timetablemodule/tt/saveslot/${day}/${slot}`;
    const code = currentCode;
    const sem = selectedSemester;
    const dataToSend = JSON.stringify({ slotData, code, sem });

    // console.log('Slot JSON Data to Send:', dataToSend);

    try {
      const response = await fetch(Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slotData, code, sem }),
        credentials: "include",
      });

      if (response) {
        const data = await response.json();
        // console.log('Slot Data sent to the backend:', data.message);
        setMessage(data.message);
      } else {
        // console.log('no response');
      }
    } catch (error) {
      // console.error('Error sending slot data to the backend:', error);
    }
  };

  const handleSubmit = async () => {
    // Mark the function as async
    const Url = `${apiUrl}/timetablemodule/tt/savett`;
    const code = currentCode;
    const sem = selectedSemester;
    const dataToSend = JSON.stringify({ timetableData, code });

    // console.log('Data is getting saved');

    setMessage("Data is being saved....");
    try {
      const response = await fetch(Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timetableData, code, sem }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('Data sent to the backend:', data);
      } else {
        console.error(
          "Failed to send data to the backend. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error sending data to the backend:", error);
    } finally {
      setMessage("Data saved successfully");
    }
  };

  const handleLockTT = async () => {
    // Mark the function as async
    setMessage("Data is being saved....");
    // await handleSubmit();
    // console.log('Data is getting Locked');
    setMessage("Data saved. Commencing lock");
    setMessage("Data is being locked");
    const Url = `${apiUrl}/timetablemodule/lock/locktt`;
    const code = currentCode;
    const sem = selectedSemester;
    try {
      const response = await fetch(Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        console.log(data.updatedTime);

        setLockedTime(data.updatedTime);
      } else {
        console.error(
          "Failed to send data to the backend. HTTP status:",
          response.status
        );
      }
    } catch (error) {
      console.error("Error sending data to the backend:", error);
    } finally {
      setMessage("Data Locked successfully");
    }
  };

  const [showMessage, setShowMessage] = useState(true);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const scrollThreshold = 1100; // Adjust this value to control when the message disappears

    if (scrollPosition > scrollThreshold) {
      setShowMessage(false);
    } else {
      setShowMessage(true);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const customStyles = {
    stripedRow: {
      _even: {
        bg: "white",
      },
    },
  };

  return (
    <Container maxW="5xl">
      <Heading as="h1" size="xl" mt="6" mb="6">
        GENERATE TIME TABLE
      </Heading>
      <Button colorScheme="teal" onClick={handleAddSem}>
        Add Semester
      </Button>
      <Button colorScheme="teal" onClick={handleAddSubject}>
        Add Subject
      </Button>
      <Button colorScheme="teal" onClick={handleAddRoom}>
        Add Room
      </Button>
      <Button colorScheme="teal" onClick={handleAddFaculty}>
        Add Faculty
      </Button>
      <Button colorScheme="teal" onClick={handleLockTT}>
        Lock TT
      </Button>
      <Button colorScheme="teal" onClick={handleViewSummary}>
        View/Download Locked TT
      </Button>

      <Box display="flex" justifyContent="right" flexDirection="column">
        <Text as="em" fontSize="sm" color="black" id="saveTime">
          Last saved on: {savedTime ? savedTime : "Not saved yet"}
        </Text>
        <Text as="em" fontSize="sm" color="black" id="lockTime">
          Last locked on: {lockedTime ? lockedTime : "Not Locked yet"}
        </Text>
      </Box>

      {/* <div style={{
  backgroundColor: 'brown',
  color: 'white',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '1.5rem', // Adjust the font size as needed
}}>
  {message}
</div> */}
      {/* Floating Message */}
      <Portal>
        <Box
          bg={showMessage && message ? "rgba(80,80,80, 0.9)" : 0} // Brighter yellow with some transparency
          color="white"
          textAlign="center"
          fontWeight="bold"
          fontSize="1.5rem"
          position="fixed"
          top="30%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex="999"
          borderRadius="20px" // Adding curved borders
          p="10px" // Padding to make it a bit larger
          opacity={showMessage ? 1 : 0}
        >
          <Text>{message}</Text>
        </Box>
      </Portal>

      {/* <Box>
        <Text as='b'>Select Semester:</Text>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >

          {semesters.map((semester, index) => (
            <option key={index} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </Box> */}
      <Box style={{ maxWidth: "300px", marginBottom: "2%", marginTop: "1%" }}>
        <Text as="b" fontSize="xl">
          Select Semester:
        </Text>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          style={{
            width: "100%",
            height: "50px", // Adjust the height as needed
            fontSize: "18px",
          }}
        >
          {semesters.map((semester, index) => (
            <option key={index} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </Box>

      {/* ediyt */}

      {Object.keys(timetableData).length === 0 ? (
        <div>Loading...</div>
      ) : (
        <Table border="5" cellSpacing="0" align="center">
          <Tr>
            <Td align="center" height="50" width="100">
              <b>Day/Period</b>
            </Td>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
              <Td key={period} align="center" height="50">
                <b>{period}</b>
              </Td>
            ))}
          </Tr>
          {days.map((day) => (
            <Tr key={day} >
              <Td align="center" height="50">
                <b>{day}</b>
              </Td>
              { [1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                <Td key={period} align="center" height="50" >
                  {timetableData[day][`period${period}`].map(
                    (slot, slotIndex) => (
                      <div key={slotIndex} className="cell-container">
                        {slot.map((cell, cellIndex) => (
                          <div key={cellIndex} className="cell-slot">
                            <select 
                              value={cell.subject}
                              onChange={(event) =>
                                handleCellChange(
                                  day,
                                  period,
                                  slotIndex,
                                  cellIndex,
                                  "subject",
                                  event
                                )
                              }
                            >
                              <option value="">Select Subject</option>
                              {availableSubjects.map((subject) => (
                                <option
                                  key={subject._id}
                                  value={subject.subName}
                                >
                                  {subject.subName}
                                </option>
                              ))}
                            </select>
                            <select
                              value={cell.room}
                              onChange={(event) =>
                                handleCellChange(
                                  day,
                                  period,
                                  slotIndex,
                                  cellIndex,
                                  "room",
                                  event
                                )
                              }
                            >
                              <option value="">Select Room</option>{" "}
                              {/* Add an empty option */}
                              {availableRooms.map((roomOption) => (
                                <option key={roomOption} value={roomOption}>
                                  {roomOption}
                                </option>
                              ))}
                            </select>
                            <select
                              value={cell.faculty}
                              onChange={(event) =>
                                handleCellChange(
                                  day,
                                  period,
                                  slotIndex,
                                  cellIndex,
                                  "faculty",
                                  event
                                )
                              }
                            >
                              <option value="">Select Faculty</option>{" "}
                              {/* Add an empty option */}
                              {availableFaculties.map((faculty, index) => (
                                <option key={index} value={faculty}>
                                  {faculty}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                        {slotIndex === 0 && (
                          <CustomPlusButton
                            className="cell-split-button"
                            onClick={() =>
                              handleSplitCell(day, period, slotIndex)
                            }
                          >
                            +
                          </CustomPlusButton>
                        )}
                        {slotIndex === 0 && slot.length > 1 && (
                          <CustomDeleteButton
                            className="cell-delete-button"
                            onClick={() =>
                              handleDeleteCell(day, period, slotIndex)
                            }
                          >
                            Delete
                          </CustomDeleteButton>
                        )}
                      </div>
                    )
                  )}
                </Td>
              ))}
            </Tr>
          ))}
        </Table>
      )}

      <Button
        mt={4}
        size="lg"
        colorScheme="gray"
        variant="outline"
        color="teal"
        onClick={handleSubmit}
      >
        Save Timetable
      </Button>

      <Box>
        <Box style={{ maxWidth: "400px", marginBottom: "2%", marginTop: "1%" }}>
          <Text fontSize="3xl" mt="10" fontWeight="bold">
            View Semester Timetable
          </Text>
          <Text fontSize="xl">Select Semester:</Text>
          <select
            value={viewselectedSemester}
            onChange={(e) => setViewSelectedSemester(e.target.value)}
            style={{
              width: "100%",
              height: "50px", // Adjust the height as needed
              fontSize: "18px",
            }}
          >
            {" "}
            <option value="">Select </option>
            {semesters.map((semester, index) => (
              <option key={index} value={semester}>
                {semester}
              </option>
            ))}
          </select>
        </Box>

        <Box>
          {viewselectedSemester ? (
            <Box>
              <Text as="em" fontSize="sm" color="black" id="saveTime">
                Last saved on: {savedTime ? savedTime : "Not saved yet"}
              </Text>

              <ViewTimetable timetableData={viewData} />
              <TimetableSummary
                timetableData={viewData}
                type={"sem"}
                code={currentCode}
              />
            </Box>
          ) : (
            <p>Please select a Semester from the dropdown.</p>
          )}
        </Box>
      </Box>
      <Box>
        <Box style={{ maxWidth: "400px", marginBottom: "2%", marginTop: "1%" }}>
          <Text fontSize="3xl" mt="10" fontWeight="bold">
            View Faculty Timetable
          </Text>
          <Text fontSize="xl">Select Faculty:</Text>
          <select
            value={viewFaculty}
            onChange={(e) => setViewFaculty(e.target.value)}
            style={{
              width: "100%",
              height: "50px", // Adjust the height as needed
              fontSize: "18px",
            }}
          >
            <option value="">Select </option>
            {availableFaculties.map((faculty, index) => (
              <option key={index} value={faculty}>
                {faculty}
              </option>
            ))}
          </select>
        </Box>

        <Box>
          {viewFaculty ? (
            <Box>
              <Text as="em" fontSize="sm" color="black" id="saveTime">
                Last saved on:{" "}
                {facultyUpdateTime ? facultyUpdateTime : "Not saved yet"}
              </Text>
              <ViewTimetable timetableData={viewFacultyData} />
              <TimetableSummary
                timetableData={viewFacultyData}
                type={"faculty"}
                code={currentCode}
              />
            </Box>
          ) : (
            <p>Please select a faculty from the dropdown.</p>
          )}
        </Box>
      </Box>

      <Box style={{ maxWidth: "400px", marginBottom: "2%", marginTop: "1%" }}>
        <Text fontSize="3xl" mt="10" fontWeight="bold">
          View Room Timetable
        </Text>
        <Text fontSize="xl">Select Room:</Text>
        <select
          value={viewRoom}
          onChange={(e) => setViewRoom(e.target.value)}
          style={{
            width: "100%",
            height: "50px", // Adjust the height as needed
            fontSize: "18px",
          }}
        >
          <option value="">Select </option>
          {availableRooms.map((room, index) => (
            <option key={index} value={room}>
              {room}
            </option>
          ))}
        </select>
      </Box>

      <Text>
        {viewRoom ? (
          <Text mb="5">
            <Text as="em" fontSize="sm" color="black" id="saveTime">
              Last saved on: {roomUpdateTime ? roomUpdateTime : "Not saved yet"}
            </Text>

            <ViewTimetable timetableData={viewRoomData} />
            {/* <TimetableSummary timetableData={viewRoomData} type={'room'} code={currentCode}/>  */}
          </Text>
        ) : (
          <Text mb="5">Please select a Room from the dropdown.</Text>
        )}
      </Text>
    </Container>
  );
};

export default Timetable;
