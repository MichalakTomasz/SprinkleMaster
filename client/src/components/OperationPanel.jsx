import { Card, Button, Switch, Typography, Box, Stack } from "@mui/material";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import { useState } from "react";

const OperationPanel = () => {
  const [isSchedulerEnabled, setIsSchedulerEnabled] = useState(false);

  const onSchedulerEnableChange = () => {
    setIsSchedulerEnabled(!isSchedulerEnabled);
  };

  return (
    <Card sx={{ p: 2 }} >
      <Stack direction="row" spacing={2} >
        <Box>
          <Switch
            checked={isSchedulerEnabled}
            onChange={onSchedulerEnableChange}
          />
          <Typography>Scheduler</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FlashOffIcon />} sx={{ m: 2 }}>
          Close all
        </Button>
      </Stack>
    </Card>
  );
};

export default OperationPanel;
