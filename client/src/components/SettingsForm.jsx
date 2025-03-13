import {
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useFormik } from "formik";

const SettingsForm = () => {
  const onSubmit = () => {};
  const formik = useFormik({
    initialValues: {
      autostartScheduler: true,
      pumpStopDelay: 3,
      schedulerTick: 3,
    },
    onSubmit: onSubmit,
  });

  return (
    <>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 2,
          "& .MuiTextField-root": { width: "100%" },
        }}
      >
        <FormControlLabel
          control={
            <Switch
              name="autostartScheduler"
              checked={formik.values.autostartScheduler}
              onChange={formik.handleChange}
            />
          }
          label="Autostart Scheduler"
        />
        <TextField
          label="Pump stop delay"
          type="number"
          name="pumpStopDelay"
          value={formik.values.pumpStopDelay}
          onChange={formik.handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Scheduler tick"
          type="number"
          name="schedulerTick"
          value={formik.values.schedulerTick}
          onChange={formik.handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button variant="outlined" type="submit">
          Update
        </Button>
      </Box>
    </>
  );
};

export default SettingsForm;
