
const { Server } = require("socket.io");
const userModel = require("../models/user.model");
const roomModel = require("../models/room.modal");
const config = require("../config/config");
const axios = require('axios');

const socketConnection = (server) => {
    const io = new Server(server,{
        cors: {
            origin: "*"
        }
    })

    const JUDGE0_API_HOST = config.JUDGE0_API_HOST;
    const JUDGE0_API_KEY = config.JUDGE0_API_KEY;
    const roomParticipants = {};
    const roomCodeStates = new Map();
    const roomSaveTimers = new Map();

    function debounceAndSave(roomId, newCode) {
        const existingTimer = roomSaveTimers.get(roomId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
    
        const newTimer = setTimeout( async() => {
            const roomData = await roomModel.findOneAndUpdate({roomId}, { codeContent: newCode },{ new:true });
            console.log(roomData);
            roomSaveTimers.delete(roomId);
        }, 1500);
    
        roomSaveTimers.set(roomId, newTimer);
    }
    

    io.use((socket, next) => {
        const token = socket.handshake?.query?.token;
        console.log(token);

        async function findUser(){
            if (token) {
                try {
                    const decoded = userModel.verifyToken(token);
                    await userModel.findById(decoded._id).select('-password').then(user => {
                        if (!user) {
                           return next(new Error('Authentication error: User not found.'));
                        }
                        socket.user = user;
                        next();
                    }).catch(err => {
                         next(new Error('Authentication error: DB error.'));
                    });
                } catch (error) {
                    next(new Error('Authentication error: Invalid token.'));
                }
            } else {
                next(new Error('Authentication error: No token provided.'));
            }
        }
        
        findUser();
    });

    io.on("connection", (socket) => {
        console.log("user connected " + socket.id + socket.user);

        socket.on("joinRoom", async ({ roomId, user }) => {

            if (!socket.user) {
                socket.emit('error', { message: 'Authentication required to join room.' });
                return;
            }

            if (!roomId) {
                socket.emit('error', { message: 'Room ID is required.' });
                return;
            }
    
            const isRoomExist = await roomModel.findOne({ roomId });
            if(!isRoomExist){
                socket.emit('error', { message: 'Room not found.' });
                return;
            }

            socket.join(roomId);

            if (!roomParticipants[roomId]) {
                roomParticipants[roomId] = {};
            }

            roomParticipants[roomId][socket.id] = {
                _id: socket.user._id,
                username: socket.user.username,
                avatar: socket.user.avatar,
            };

            const participantsList = Object.values(roomParticipants[roomId]);

            socket.to(roomId).emit('userJoined', roomParticipants[roomId][socket.id]);

            socket.emit('roomData', { participantsList, currentCode: isRoomExist.codeContent, language: isRoomExist.language });

            await roomModel.findOneAndUpdate({ roomId: roomId },{ $addToSet: { participants: socket.user._id } });

        })

        socket.on("sendMessage", ({ roomId, text }) => {
            if (!socket.user) return;

            const message = {
                user: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    avatar: socket.user.avatar
                },
                text: text,
                timestamp: new Date()
            };

            io.to(roomId).emit("newMessage", message)
        })

        socket.on("codeChange", ({roomId, newCode}) => {
            roomCodeStates.set(roomId, newCode);
            io.to(roomId).emit("updateCode", newCode);
            debounceAndSave(roomId, newCode)
        })

        socket.on("runCode", async ({ roomId, languageId, code, stdin = "" }) => {
            console.log(`[Run Code] Received request for language ${languageId}`);
            if (!JUDGE0_API_HOST || !JUDGE0_API_KEY) {
                console.error("[Run Code] Judge0 API host or key not configured.");
                socket.emit('codeOutput', { stderr: "Code execution service is not configured on the server." });
                return;
            }

            const options = {
                method: 'POST',
                url: `https://${JUDGE0_API_HOST}/submissions`,
                params: { base64_encoded: 'false', wait: 'true', fields: '*' },
                headers: {
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': JUDGE0_API_KEY,
                    'X-RapidAPI-Host': JUDGE0_API_HOST
                },
                data: {
                    language_id: languageId,
                    source_code: code,
                    stdin: stdin
                }
            };

            try {
                const response = await axios.request(options);
                console.log('[Run Code] Judge0 Response:', response.data);
                socket.emit('codeOutput', response.data);
        
            } catch (error) {
                console.error('[Run Code] Judge0 API Error:', error.response?.data || error.message);
                 socket.emit('codeOutput', {
                     stderr: error.response?.data?.message || error.message || 'Failed to execute code via external service.',
                     status: { description: 'API Error' }
                 });
            }

        })

        socket.on("disconnect", async () => {
            console.log("❌ User disconnected: " + socket.id);

            for (const roomId in roomParticipants) {
                if (roomParticipants[roomId][socket.id]) {
                    console.log(`${socket.user?.name || socket.id} leaving room: ${roomId}`);
                    const leavingUser = roomParticipants[roomId][socket.id]; // Get user info before deleting
    
                    // Remove user from tracking object
                    delete roomParticipants[roomId][socket.id];
    
                    // Notify remaining participants in the room
                    if (leavingUser) { // Ensure we have user info to send
                        socket.to(roomId).emit('userLeft', leavingUser._id); // Send user ID
                    }
    
                    // Optional: If room is now empty, delete it from tracking object
                    if (Object.keys(roomParticipants[roomId]).length === 0) {
                        console.log(`Room ${roomId} is now empty, removing from tracking.`);
                        delete roomParticipants[roomId];
                    } else {
                         console.log(`Remaining participants in room ${roomId}:`, Object.values(roomParticipants[roomId]).map(p=>p.name));
                    }
    
                     // Room.updateOne({ roomId }, { $pull: { participants: leavingUser?._id } });
                    await roomModel.findOneAndUpdate({ roomId: roomId }, { $pull: { participants: leavingUser._id }});
                    break;
                }
            }

        });
    })

}

module.exports = socketConnection