import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export function initializeSocket(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.on('connection', (socket: Socket) => {
        console.log(`New connection: ${socket.id}`);
    
        socket.on('book-appointment', (data) => {
            console.log("book appointment data recieved from patient", data);
            io.emit('patient-request', data);
        });
    
        socket.on('sendTicketToUser', (data) => {
            console.log("book appointment data recieved from receptionist", data);
            io.emit('fetch-ticket');
            io.emit('UserTicket', data);
        })
    
        socket.on('doctorFetchQueue', ()=> {
           io.emit('doctorFetchQueue');
        });
    
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    
        // Example event listener
        socket.on('message', (message: string) => {
            console.log(`Message received: ${message}`);
            io.emit('message', message); // Broadcast the message to all clients
        });
    });
}