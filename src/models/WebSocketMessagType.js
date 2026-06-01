const WebSocketMessageType = {
    TaskAdded : 'TaskAdded',
    TaskUpdated : 'TaskUpdated',
    TaskDeleted : 'TaskDeleted',
    ValveAssignedToTask : 'ValveAssignedToTask',
    ValveUnassignedFromTask : 'ValveUnassignedFromTask',
    TaskStatusChanged : 'TaskStatusChanged',
    DeviceAdded : 'DeviceAdded',
    DeviceUpdated : 'DeviceUpdated',
    DeviceDeleted : 'DeviceDeleted',
    DeviceStatusChanged : 'DeviceStatusChanged',
    AllValvesClosed : 'AllValvesClosed',
}

export default WebSocketMessageType