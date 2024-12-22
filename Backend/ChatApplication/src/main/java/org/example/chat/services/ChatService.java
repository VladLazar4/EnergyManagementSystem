package org.example.chat.services;

import jakarta.persistence.Table;
import org.example.chat.entities.Chat;
import org.example.chat.repositories.ChatRepository;
import org.example.chat.controllers.WebSocketController;
import org.example.chat.dtos.ChatDTO;
import org.example.chat.dtos.builders.ChatBuilder;
//import org.example.chat.entities.Chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Component
@Service
@Table(name = "chats")
public class ChatService {
    private static final Logger LOGGER = LoggerFactory.getLogger(org.example.chat.services.ChatService.class);
    private final ChatRepository chatRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository, WebSocketController webSocketController) {
        this.chatRepository = chatRepository;
//        this.webSocketController = webSocketController;
    }

//    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME_MEASUREMENT)
//    public void receiveMessage(Map<String, Object> payload) {
//
//        ObjectMapper objectMapper = new ObjectMapper();
//        Timestamp timestamp = objectMapper.convertValue(payload.get("timestamp"), Timestamp.class);
//        UUID deviceId = objectMapper.convertValue(payload.get("deviceId"), UUID.class);
//        Float measurementValue = objectMapper.convertValue(payload.get("measurementValue"), Float.class);
//
//        deviceMeasurementList.putIfAbsent(deviceId.toString(), new ArrayList<>());
//        List<Float> list = deviceMeasurementList.get(deviceId.toString());
//        synchronized (list){
//            list.add(measurementValue);
//
//            if(list.size() == 6){
//                float measurementValueCurrentHour = list.stream().reduce(0.0f, Float::sum);
//
//                MeasurementDTO measurementDTO = new MeasurementDTO();
//                measurementDTO.setDeviceId(deviceId);
//                measurementDTO.setMeasurementValue(measurementValueCurrentHour);
//                measurementDTO.setTimestamp(timestamp);
//                insert(measurementDTO);
//
//                Device device = deviceRepository.findDeviceById(deviceId);
//
//                Float maxValuePerHour = device.getMaxHourlyConsumption();
//                UUID ownerId = device.getOwnerId();
//                if(measurementValueCurrentHour > maxValuePerHour){
//                    webSocketController.sendNotification(deviceId, ownerId, measurementValueCurrentHour);
//                }
//
//                list.clear();
//            }
//        }
//    }
//
//
//    public UUID insert(MeasurementDTO measurementDTO) {
//        Measurement measurement = MeasurementBuilder.toEntity(measurementDTO);
//
//        measurement = measurementRepository.save(measurement);
//        LOGGER.debug("Measurement with id {} was inserted in db", measurement.getId());
//        return measurement.getId();
//    }
//
//    public List<MeasurementDTO> findMeasurementsByDeviceIdInDate(UUID deviceId, String selectedDateString) {
//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
//        LocalDate localDate = LocalDate.parse(selectedDateString, formatter);
//        ZoneId zoneId = ZoneId.systemDefault();
//        ZonedDateTime startOfDay = localDate.atStartOfDay(zoneId);
//        ZonedDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
//
//        long startTimestamp = startOfDay.toInstant().toEpochMilli();
//        long endTimestamp = endOfDay.toInstant().toEpochMilli();
//
//        List<Measurement> measurementList = measurementRepository.findMeasurementsByDeviceIdAndTimestampBetween(deviceId, startTimestamp, endTimestamp);
//        return measurementList.stream()
//                .sorted(Comparator.comparing(Measurement::getTimestamp))
//                .map(MeasurementBuilder::toMeasurementDTO)
//                .collect(Collectors.toList());
//    }

    public List<ChatDTO> findOpenChats(UUID adminId) {
        List<Chat> chats = chatRepository.findAllByAdminId(adminId);
        return chats.stream()
                .map(ChatBuilder::toChatDTO)
                .collect(Collectors.toList());
    }

    public List<ChatDTO> findOpenChatsClient(UUID clientId) {
        List<Chat> chats = chatRepository.findAllByClientId(clientId);
        return chats.stream()
                .map(ChatBuilder::toChatDTO)
                .collect(Collectors.toList());
    }

    public UUID createChat(ChatDTO chatDTO) {
        Chat chat = ChatBuilder.toEntity(chatDTO);
        chatRepository.save(chat);
        return chat.getId();
    }
}
