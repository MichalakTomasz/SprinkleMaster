import { Stack } from "@mui/material";
import Device from "./Device.jsx";
import { useState, useEffect } from 'react'
import container from "../container/container.js";

const Devices = () => {

  const controller = container.resolve('mainController')
  const [valves, setValves ] = useState()

  useEffect(() => {
    const getValves = async () => {
      const res = await controller.getValves()
      if (res) {
        setValves(res)
      }
    }

    getValves()
  }, [])

  return (
    <Stack 
        direction="row" 
        spacing={2}
        sx={{
            flexWrap: "wrap",
            rowGap: 2
        }}>
      {valves?.map((device) => (
        <Device key={device.id} device={device} />
      ))}
    </Stack>
  );
};

export default Devices;
