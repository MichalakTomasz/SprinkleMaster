import { 
    Card, 
    CardContent, 
    CardActions, 
    Typography, 
    Switch, 
    Button,
    Box 
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material"
import Device from './Device.jsx'
import { useState } from 'react'
import TaskDialog from './TaskDialog'
import PinState from '../models/PinState.js'

const Task = ({ task }) => {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')

    const handleClose = () => {
        setOpen(false)
    }
        
    const onEditClick = () => {
        setTitle("Edit")
        setOpen(true)
    }

    const onDeleteClick = () => {
        // Add delete logic here
    }

    return (
        <Card sx={{ minWidth: 275, margin: 2 }}>
          <CardContent>
            <Box>
                <Typography variant="h5" component="div" gutterBottom>
                    {task.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography component="span">State:</Typography>
                    <Switch checked={task.state == PinState.HIGH} />
                </Box>
                <Typography component="div">
                    Start: {task.start}
                </Typography>
                <Typography component="div">
                    Stop: {task.stop}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography component="span">Active:</Typography>
                    <Switch checked={task.isActive} />
                </Box>
            </Box>
            <Box mt={2}>
                {task.devices?.map((device) => (
                    <Device key={device.id} device={device} />
                ))}
            </Box>
            <CardActions>
                <Button 
                    onClick={onEditClick} 
                    variant="outlined" 
                    startIcon={<Edit/>}
                >
                    Edit
                </Button>
                <Button 
                    onClick={onDeleteClick} 
                    variant="outlined" 
                    startIcon={<Delete/>}
                >
                    Delete
                </Button>
                <TaskDialog 
                    title={title} 
                    task={task} 
                    open={open} 
                    onClose={handleClose}
                />
            </CardActions>
          </CardContent>
        </Card>
    )
}

export default Task