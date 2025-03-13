import MainMenu from "./MainMenu.jsx";
import MessageBar from "./MessageBar.jsx";
import DeviceStatus from "./DeviceStatus.jsx";
import OperationPanel from "./OperationPanel.jsx";
import { Box, Stack, Typography, Button } from "@mui/material";
import { Settings } from "@mui/icons-material";
import SettingsDialog from './SettingsDialog.jsx'
import  {useState } from 'react'

const Dashboard = () => {
    const [open, setOpen] = useState(false)
    const handleClose = () => {
        setOpen(false)
    }
    const onClick = () => {
        setOpen(true)
    }

  return (
    <Stack spacing={2}>
      <Stack direction='row'sx={{ justifyContent: "space-between", alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="overlined" onClick={onClick} startIcon={<Settings size='large' sx={{ fontSize: 30}} /> }/>
        <SettingsDialog open={open} onClose={handleClose}/>
      </Stack>

      <Stack spacing={2}>
        <Box>
          <DeviceStatus />
        </Box>
        <Box>
          <OperationPanel />
        </Box>
        <Box>
          <MainMenu />
        </Box>
        <Box>
          <MessageBar />
        </Box>
      </Stack>
    </Stack>
  );
};

export default Dashboard;
