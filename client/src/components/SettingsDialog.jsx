import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button"
import SettingsForm from './SettingsForm.jsx'

const SettingsDialog = ({ open, onClose }) => {
  const onSubmit = (event) => {
    event.preventDefault();
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <SettingsForm/>
      </DialogContent>

      <DialogActions>
        <Button onClick={onSubmit} type="submit">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
