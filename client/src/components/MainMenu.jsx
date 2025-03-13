import { useState } from "react";
import { Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import DevicePanel from "./DevicePanel.jsx"
import TaskPanel from "./TaskPanel.jsx"
const MainMenu = () => {
  const [value, setValue] = useState("1");
  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange}>
        <Tab label="Valves" value="1" />
        <Tab label="Tasks" value="2" />
      </TabList>
      <TabPanel value="1">
        <DevicePanel deviceType='Valve'/>
      </TabPanel>      
      <TabPanel value="2">
        <TaskPanel/>
      </TabPanel>
    </TabContext>
  )
}


export default MainMenu;
