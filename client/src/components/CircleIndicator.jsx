import { Box } from '@mui/material';

const  CircleIndicator = ({ isActive }) => {
  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: isActive ? 'green' : 'red',
      }}
    />
  );
}

export default CircleIndicator

