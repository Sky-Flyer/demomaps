package at.schweitzerproductions.todoliste;

import at.schweitzerproductions.todoliste.model.TodolistModel;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TodolistModelRepository extends CrudRepository<TodolistModel, Long> {
    List<TodolistModel> findByTitle(String title);
}

// TODO: 18.05.22 persistence ausbauen: https://www.baeldung.com/persistence-with-spring-series/