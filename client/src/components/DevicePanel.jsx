import { Button } from  '@mui/material'
import DeviceDialog from './DeviceDialog.jsx'
import Devices from './Devices.jsx'
import { Add } from '@mui/icons-material'
import { useState } from 'react'

const DevicePanel = ({ deviceType }) => {
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
            <Button onClick={onClick} variant="outlined" startIcon={<Add/>} sx={{m:2}}>Add {deviceType}</Button>
            <Devices />
            <DeviceDialog title={title} open={open} onClose={handleClose} />
        </>
    )
}

export default DevicePanel