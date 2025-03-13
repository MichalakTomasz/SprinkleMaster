import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button"
import TaskForm from './TaskForm.jsx'

const TaskDialog = ({title, task, open, onClose }) => {
  const onSubmit = (event) => {
    event.preventDefault();
    onClose();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TaskForm task={task}/>
      </DialogContent>

      <DialogActions>
        <Button onClick={onSubmit} type="submit">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDialog;
