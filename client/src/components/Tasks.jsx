import { Stack } from "@mui/material";
import Task from "./Task.jsx";
import { useState, useEffect } from 'react'
import container from "../container/container.js";

const Tasks = () => {
  const controller = container.resolve('mainController')
  const [tasks, setTasks] = useState()

  useEffect(() => {
    const getTasks = async () => {
      const result = await controller.getTasks()
      if (result) {
        setTasks(result)
      }
    }

    getTasks()
  }, [])

  return (
    <Stack direction="row" spacing={2}
    sx={{
        flexWrap: "wrap",
        rowGap: 2
    }}>
      {tasks?.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </Stack>
  );
};

export default Tasks;
