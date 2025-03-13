import { Box, TextField, Button, Switch, FormControlLabel } from '@mui/material'
import { useFormik } from "formik"
import ClientTask from "../models/ClientTask"
import TaskController from "../controllers/MainController.js"
import Period from '../models/Period.js'

const TaskForm = ( { task }) => {
  
  const isUpdate = task != undefined

  const onSubmit = (values) => {

    if (isUpdate) {

    } else {
      const clientTask = new ClientTask(0, values.name, values.pinNo, values.start, values.stop, values.period, values.isActive)
      const taskController = new TaskController()
      taskController.addTask(clientTask)
    }
    
  }

  const formik = useFormik({
    initialValues: {
      id: isUpdate ? task.id : 0,
      name: isUpdate ? task.name : '',
      start: isUpdate ? task.start : '',
      stop: isUpdate ? task.stop : '',
      period: Period.EVERYDAY,
      isActive: isUpdate ? task?.isActive : false
    },
    onSubmit: onSubmit
  })

  return (
    <>
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          padding: 2,
          '& .MuiTextField-root': { width: '100%' },
        }}
      >
            <TextField 
              label="Name"
              type="text" 
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            <TextField 
              label="Start Time"
              type="time" 
              name="start"
              value={formik.values.start}
              onChange={formik.handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField 
              label="Stop Time"
              type="time" 
              name="stop"
              value={formik.values.stop}
              onChange={formik.handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  name="isActive"
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                />
              }
              label="Active"
            />
            <Button variant="outlined" type="submit">{isUpdate ? 'Update' : 'Add'}</Button>
      </Box>
    </>
  )
}

export default TaskForm
