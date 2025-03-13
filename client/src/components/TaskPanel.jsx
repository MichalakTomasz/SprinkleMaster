import { Button } from  '@mui/material'
import Tasks from './Tasks.jsx'
import { Add } from '@mui/icons-material'
import TaskDialog from './TaskDialog.jsx'
import { useState } from 'react'

const DevicesPanel = () => {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    
    const handleClose = () => {
        setOpen(false)
    
    }
    const onClick = () => {
        setTitle("Add")
        setOpen(true)
    }
    return (
        <>
            <Button onClick={onClick}  variant="outlined" startIcon={<Add/>}  sx={{m:2}} >Add Task</Button>
            <Tasks />
            <TaskDialog title={title} open={open} onClose={handleClose}/>
        </>
    )
}

export default DevicesPanel