import Dashboard from "../components/Dashboard"
import About from "../components/About"
import TaskForm from "./TaskForm.jsx"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

const Nav = () => {
    return (
        <Router>
            <Routes>
                <Route exact path="/" Component={Dashboard} />
                <Route path="/newtask" Component={TaskForm} />
                <Route path="/about" Component={About} />
            </Routes>
        </Router>
    )
}

export default Nav