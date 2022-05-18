package at.schweitzerproductions.todoliste;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("at.schweitzerproductions.todoliste")
@EntityScan("at.schweitzerproductions.todoliste.model")
public class TodolisteApplication {

	public static void main(String[] args) {
		SpringApplication.run(TodolisteApplication.class, args);
	}

}
