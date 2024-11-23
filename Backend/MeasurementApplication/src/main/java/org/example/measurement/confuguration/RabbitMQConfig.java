package org.example.measurement.confuguration;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    String queue = "measurement";
    @Bean
    public Queue sensorsQueue() {
        return new Queue(queue, false);
    }

    @Bean public Queue devicesQueue() {
        return new Queue(queue, true);
    }
}
