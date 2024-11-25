//package org.example.measurement.confuguration;
//
//import org.springframework.web.socket.WebSocketHandler;
//import org.springframework.web.socket.WebSocketSession;
//import org.springframework.web.socket.TextMessage;
//import org.springframework.web.socket.CloseStatus;
//import org.springframework.stereotype.Component;
//
//@Component
//public class MyWebSocketServer implements WebSocketHandler {
//
//    @Override
//    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
//        System.out.println("New WebSocket connection established: " + session.getId());
//        session.sendMessage(new TextMessage("Connection established with server"));
//    }
//
//    @Override
//    public void handleMessage(WebSocketSession session, org.springframework.web.socket.WebSocketMessage<?> message) throws Exception {
//        // Handle received messages from the client (e.g., echoing them)
//        String msg = (String) message.getPayload();
//        System.out.println("Received message: " + msg);
//        session.sendMessage(new TextMessage("Echo: " + msg));
//    }
//
//    @Override
//    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
//        System.err.println("Error with WebSocket session: " + session.getId());
//        exception.printStackTrace();
//    }
//
//    @Override
//    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
//        System.out.println("WebSocket connection closed: " + session.getId());
//    }
//
//    @Override
//    public boolean supportsPartialMessages() {
//        return false;
//    }
//}
