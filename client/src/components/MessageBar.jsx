import { 
    Card, 
    CardContent, 
    Typography,
    Box,
    Stack
} from '@mui/material'

const MessageBar = ({ messages }) => {
    return (
        <Box sx={{ position: 'relative', mt: 3, mb: 3 }}>
            <Typography
                sx={{
                    position: 'absolute',
                    top: -12,
                    left: 8,
                    backgroundColor: 'white',
                    padding: '0 4px',
                }}
            >
                Terminal
            </Typography>
            <Card variant="outlined">
                <CardContent>
                    <Stack direction="column">
                        { messages }
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    )
}

export default MessageBar