import { Box, TextField, Button } from '@mui/material'
import { useFormik } from "formik"
import ClientTask from "../models/ClientTask"
import TaskController from "../controllers/MainController"

const DeviceForm = ( { device }) => {
  
  const isUpdate = device != undefined

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
      id: isUpdate ? device.id : 0,
      name: isUpdate ? device.name : '',
      pinNo: isUpdate ? device.pinNo : 0,
      type: isUpdate ? device.type : ''
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
              label="GPIO pin"
              type="numeric" 
              name="PinNo"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            <Button variant="outlined" type="submit">{isUpdate ? 'Update' : 'Add'}</Button>
      </Box>
    </>
  )
}

export default DeviceForm
