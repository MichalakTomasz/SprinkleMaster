import { CardContent, CardActions, Switch, Typography, Card, Button } from '@mui/material'
import PinState from '../models/PinState.js'
import { Edit, Delete } from '@mui/icons-material'
import { useState } from 'react'
import DeviceDialog from './DeviceDialog'

const Device = ({ device }) => {
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

    }

    return (
        <Card key={device.id} sx={{ minWidth: 275, margin: 2 }}>
            <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                    {device.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                    State: <Switch checked={device.state == PinState.HIGH} />
                </Typography>
                <Typography variant="body2">
                    GPIO Pin: {device.pinNo}
                </Typography>
            </CardContent>
            <CardActions>
                <Button onClick={onEditClick} variant="outlined" startIcon={<Edit/>}>Edit</Button>
                <Button onClick ={onDeleteClick} variant="outlined" startIcon={<Delete/>}>Delete</Button>
                <DeviceDialog 
                    title={title} 
                    task={device} 
                    open={open} 
                    onClose={handleClose}
                />
            </CardActions>
        </Card>
    )
}

export default Device