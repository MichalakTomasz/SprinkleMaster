import { Card, CardContent, Stack, Typography } from "@mui/material";
import CircleIndicator from "./CircleIndicator";
import PinState from "../models/PinState";
import { pump, valves } from "../setup/mock-data.js";

const DeviceStatus = () => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} direction='row'>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography>Pump:</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography>State:</Typography>
              <CircleIndicator isActive={pump?.state == PinState.HIGH} />
            </Stack>
          </Stack>
          <Stack spacing={2} direction="row">
            <Typography>Valves:</Typography>
            {valves?.map((valve) => (
              <Stack key={valve.id} direction={"row"}>
                <Typography>{valve.name}: </Typography>
                <CircleIndicator isActive={valve.state == PinState.HIGH} />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DeviceStatus;
