export default class MainController {

    constructor(config) {
        this.baseUrl = config.baseUrl
    }
    addTask = async (task) => {
        try{
            const data = await fetch(this.baseUrl + 'gpio/addTask', {
                method: 'POST',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify(task)
            })
            return data?.json()
        }
        catch(e){
            return e.message
        }
    }

    getPinState = async (pinNo) => {
        try {
            const data = await fetch(this.baseUrl + 'gpio/getPinState' + pinNo, {
                method: 'GET',
                headers: { 'Content-type': 'application/json'}
            })
            return data?.json()
        }
        catch (e) {
            return e.message
        }
    }

    setPinState = async (pin) => {
        try {
            const data = await fetch(this.baseUrl + 'gpio/setPinState', {
                method: 'POST',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify(pin)
            })
            return data?.json()
        }
        catch (e) {
            return e.message
        }
    }
  
    getTasks = async () => {
        try{
            const data = await fetch(this.baseUrl + 'gpio/task', {
                method: 'GET',
                headers: { 'Content-type': 'application/json'}
            })
    
            return data?.json()
        }
        catch(e){
            console.log(JSON.stringify(e))
            return e.message
        }
        
    }

    updateTask = async (task) => {
        try{
            const data = await fetch(this.baseUrl + 'updateTask', {
                method: 'PUT',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify(task)
            })
    
            return data
        }
        catch(e){
            return e.message
        }
    }
    
    deleteTask = async (id) => {
        try{
            const data = await fetch(this.baseUrl + 'gpio/deleteTask/' + id, { 
                method: 'DELETE',
                headers: { 'Content-type': 'application/json'}
            })
            return data
        }
        catch(e){
            return e.message
        }
    }

    getValves = async () => {
        try{
            console.log('url ', this.baseUrl)
            const data = await fetch(this.baseUrl + 'gpio/valve', {
                method: 'GET',
                headers: { 'Content-type': 'application/json'}
            })
    
            return data?.json()
        }
        catch(e){
            throw new Error(e.message)
        }
        
    }

    getPump = async () => {
        try{
            const data = await fetch(this.baseUrl + 'gpio/pump', {
                method: 'GET',
                headers: { 'Content-type': 'application/json'}
            })
    
            return data
        }
        catch(e){
            return e.message
        }
        
    }

    stopScheduler = async () => {
        try{
            const data = await fetch(this.baseUrl + 'gpio/stopScheduler', {
                method: 'GET',
                headers: { 'Content-type': 'application/json'}
            })
    
            return data
        }
        catch(e){
            return e.message
        }
        
    }
}