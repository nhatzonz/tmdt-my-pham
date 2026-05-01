package com.mypham;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MyPhamApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyPhamApplication.class, args);
    }
}
